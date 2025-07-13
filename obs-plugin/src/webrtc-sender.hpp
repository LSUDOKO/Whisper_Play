#pragma once
#include <cstddef>

// Initialize WebRTC sender with signaling server URL
bool initialize_webrtc_sender(const char* signaling_url);

// Send audio data to connected peers
void send_audio_data(const uint8_t* data, size_t size);

// Cleanup WebRTC connections
void cleanup_webrtc_sender();
