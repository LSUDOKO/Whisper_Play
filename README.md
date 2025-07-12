# WhisperPlay

A real-time audio streaming and translation system with OBS plugin and browser extension.

## Components

1. OBS Plugin (`/obs-plugin`)
   - Audio capture and encryption
   - WebRTC streaming
   - Written in C++

2. Browser Extension (`/extension`)
   - Audio reception and decryption
   - Real-time translation
   - Language toggle
   - Written in JavaScript/TypeScript

3. Signaling Server (`/server`)
   - WebRTC signaling
   - Written in Node.js

## Requirements

### OBS Plugin
- CMake 3.x
- Visual Studio 2019+ (Windows)
- OBS Studio SDK
- libwebrtc
- OpenSSL

### Browser Extension
- Node.js 18.x+
- npm/yarn

### Server
- Node.js 18.x+
- npm/yarn

## Development Setup

Detailed setup instructions for each component coming soon.

## Features

- Real-time audio streaming via WebRTC
- End-to-end encryption
- Multi-language support with real-time translation
- Low latency (<200ms for audio, <1s for translation)
- Cross-platform compatibility
