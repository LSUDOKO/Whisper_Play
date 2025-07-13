#pragma once

#include <obs-module.h>
#include <string>
#include <queue>
#include <mutex>
#include <openssl/aes.h>
#include <webrtc/api/peer_connection_interface.h>

class AudioCapture {
private:
    obs_source_t* source;
    std::queue<std::vector<uint8_t>> audioQueue;
    std::mutex queueMutex;
    AES_KEY aesKey;
    rtc::scoped_refptr<webrtc::PeerConnectionFactoryInterface> peerConnectionFactory;
    rtc::scoped_refptr<webrtc::PeerConnectionInterface> peerConnection;
    rtc::scoped_refptr<webrtc::DataChannelInterface> dataChannel;

    static void audioCallback(void* param, obs_source_t* source, 
                            const struct audio_data* data, bool muted);
    void processAudioData(const uint8_t* data, size_t size, bool muted);
    std::vector<uint8_t> encryptAudioChunk(const std::vector<uint8_t>& chunk);

public:
    AudioCapture();
    ~AudioCapture();

    bool init(const char* deviceId);
    void start();
    void stop();
    bool isCapturing() const;
    void setEncryptionKey(const std::string& key);
    bool initializeWebRTC(const std::string& signalingServerUrl);
};
