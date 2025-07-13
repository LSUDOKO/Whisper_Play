#include "audio_capture.hpp"
#include <obs-module.h>
#include <util/platform.h>
#include <openssl/evp.h>
#include <webrtc/api/create_peerconnection_factory.h>

AudioCapture::AudioCapture() : source(nullptr) {
    // Initialize WebRTC threading
    rtc::ThreadManager::Instance()->WrapCurrentThread();
}

AudioCapture::~AudioCapture() {
    stop();
}

bool AudioCapture::init(const char* deviceId) {
    obs_audio_info audio_info;
    obs_get_audio_info(&audio_info);

    obs_data_t* settings = obs_data_create();
    obs_data_set_string(settings, "device_id", deviceId);
    
    source = obs_source_create("wasapi_input_capture", "whisperplay_mic", settings, nullptr);
    obs_data_release(settings);

    if (!source)
        return false;

    obs_source_add_audio_capture_callback(source, audioCallback, this);
    return true;
}

void AudioCapture::start() {
    if (source)
        obs_source_set_enabled(source, true);
}

void AudioCapture::stop() {
    if (source) {
        obs_source_set_enabled(source, false);
        obs_source_remove_audio_capture_callback(source, audioCallback, this);
        obs_source_release(source);
        source = nullptr;
    }
}

bool AudioCapture::isCapturing() const {
    return source != nullptr && obs_source_active(source);
}

void AudioCapture::audioCallback(void* param, obs_source_t* source, 
                               const struct audio_data* data, bool muted) {
    AudioCapture* self = static_cast<AudioCapture*>(param);
    self->processAudioData(data->data[0], data->frames * sizeof(float), muted);
}

void AudioCapture::processAudioData(const uint8_t* data, size_t size, bool muted) {
    if (muted || !data || size == 0)
        return;

    // Create 100ms chunks (assuming 48kHz sample rate)
    const size_t samplesPerChunk = 4800;
    const size_t bytesPerChunk = samplesPerChunk * sizeof(float);

    std::vector<uint8_t> chunk(data, data + std::min(size, bytesPerChunk));
    auto encryptedChunk = encryptAudioChunk(chunk);

    if (dataChannel && dataChannel->state() == webrtc::DataChannelInterface::kOpen) {
        webrtc::DataBuffer buffer(rtc::CopyOnWriteBuffer(encryptedChunk.data(), encryptedChunk.size()), true);
        dataChannel->Send(buffer);
    }
}

std::vector<uint8_t> AudioCapture::encryptAudioChunk(const std::vector<uint8_t>& chunk) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    std::vector<uint8_t> encrypted(chunk.size() + EVP_MAX_BLOCK_LENGTH);
    int outLen1, outLen2;

    // Generate random IV
    unsigned char iv[16];
    if (RAND_bytes(iv, sizeof(iv)) != 1) {
        blog(LOG_ERROR, "Failed to generate IV");
        return {};
    }

    EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), nullptr, nullptr, nullptr);
    EVP_EncryptInit_ex(ctx, nullptr, nullptr, (const unsigned char*)&aesKey, iv);

    EVP_EncryptUpdate(ctx, encrypted.data(), &outLen1, chunk.data(), chunk.size());
    EVP_EncryptFinal_ex(ctx, encrypted.data() + outLen1, &outLen2);

    unsigned char tag[16];
    EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, 16, tag);
    EVP_CIPHER_CTX_free(ctx);

    // Prepend IV and append tag
    std::vector<uint8_t> result;
    result.reserve(16 + outLen1 + outLen2 + 16);
    result.insert(result.end(), iv, iv + 16);
    result.insert(result.end(), encrypted.begin(), encrypted.begin() + outLen1 + outLen2);
    result.insert(result.end(), tag, tag + 16);

    return result;
}

void AudioCapture::setEncryptionKey(const std::string& key) {
    if (AES_set_encrypt_key((const unsigned char*)key.c_str(), 256, &aesKey) != 0) {
        blog(LOG_ERROR, "Failed to set encryption key");
    }
}

bool AudioCapture::initializeWebRTC(const std::string& signalingServerUrl) {
    peerConnectionFactory = webrtc::CreatePeerConnectionFactory(
        nullptr /* network_thread */,
        nullptr /* worker_thread */,
        nullptr /* signaling_thread */,
        nullptr /* default_adm */,
        webrtc::CreateBuiltinAudioEncoderFactory(),
        webrtc::CreateBuiltinAudioDecoderFactory(),
        nullptr /* video_encoder_factory */,
        nullptr /* video_decoder_factory */,
        nullptr /* audio_mixer */,
        nullptr /* audio_processing */
    );

    if (!peerConnectionFactory) {
        blog(LOG_ERROR, "Failed to create peer connection factory");
        return false;
    }

    webrtc::PeerConnectionInterface::RTCConfiguration config;
    config.sdp_semantics = webrtc::SdpSemantics::kUnifiedPlan;
    config.enable_dtls_srtp = true;
    config.enable_rtp_data_channel = false;

    webrtc::PeerConnectionInterface::IceServer server;
    server.uri = "stun:stun.l.google.com:19302";
    config.servers.push_back(server);

    peerConnection = peerConnectionFactory->CreatePeerConnection(
        config,
        nullptr /* port_allocator */,
        nullptr /* cert_generator */,
        nullptr /* observer */
    );

    if (!peerConnection) {
        blog(LOG_ERROR, "Failed to create peer connection");
        return false;
    }

    webrtc::DataChannelInit dataChannelConfig;
    dataChannelConfig.ordered = true;
    dataChannelConfig.maxRetransmits = 0;

    dataChannel = peerConnection->CreateDataChannel("audio", &dataChannelConfig);
    if (!dataChannel) {
        blog(LOG_ERROR, "Failed to create data channel");
        return false;
    }

    return true;
}
