#include "webrtc-sender.hpp"
#include <webrtc/api/create_peerconnection_factory.h>
#include <webrtc/api/audio_codecs/builtin_audio_decoder_factory.h>
#include <webrtc/api/audio_codecs/builtin_audio_encoder_factory.h>
#include <webrtc/rtc_base/ssl_adapter.h>
#include <webrtc/media/engine/webrtc_media_engine.h>
#include <webrtc/modules/audio_device/include/audio_device.h>
#include <mutex>
#include <queue>

class WebRTCSender {
private:
    rtc::scoped_refptr<webrtc::PeerConnectionFactoryInterface> peer_connection_factory_;
    rtc::scoped_refptr<webrtc::PeerConnectionInterface> peer_connection_;
    rtc::scoped_refptr<webrtc::AudioTrackInterface> audio_track_;
    std::unique_ptr<rtc::Thread> network_thread_;
    std::unique_ptr<rtc::Thread> worker_thread_;
    std::unique_ptr<rtc::Thread> signaling_thread_;
    
    std::mutex audio_mutex_;
    std::queue<std::vector<uint8_t>> audio_queue_;
    
public:
    WebRTCSender() {
        network_thread_ = rtc::Thread::Create();
        worker_thread_ = rtc::Thread::Create();
        signaling_thread_ = rtc::Thread::Create();
        
        network_thread_->Start();
        worker_thread_->Start();
        signaling_thread_->Start();
        
        peer_connection_factory_ = webrtc::CreatePeerConnectionFactory(
            network_thread_.get(),
            worker_thread_.get(),
            signaling_thread_.get(),
            nullptr,
            webrtc::CreateBuiltinAudioEncoderFactory(),
            webrtc::CreateBuiltinAudioDecoderFactory(),
            nullptr,
            nullptr);
    }
    
    void SendAudioData(const uint8_t* data, size_t size) {
        std::lock_guard<std::mutex> lock(audio_mutex_);
        audio_queue_.push(std::vector<uint8_t>(data, data + size));
        // Process audio queue and send via WebRTC
        ProcessAudioQueue();
    }
    
private:
    void ProcessAudioQueue() {
        while (!audio_queue_.empty()) {
            auto& audio_data = audio_queue_.front();
            // Convert and send audio data through WebRTC
            // TODO: Implement actual WebRTC audio sending
            audio_queue_.pop();
        }
    }
};

static std::unique_ptr<WebRTCSender> g_webrtc_sender;

bool initialize_webrtc_sender(const char* signaling_url) {
    rtc::InitializeSSL();
    g_webrtc_sender = std::make_unique<WebRTCSender>();
    return true;
}

void send_audio_data(const uint8_t* data, size_t size) {
    if (g_webrtc_sender) {
        g_webrtc_sender->SendAudioData(data, size);
    }
}

void cleanup_webrtc_sender() {
    g_webrtc_sender.reset();
    rtc::CleanupSSL();
}
