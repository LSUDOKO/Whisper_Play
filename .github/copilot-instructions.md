<!-- Use this file to provide workspace-specific custom instructions to Copilot -->

# WhisperPlay Project Instructions

## Project Overview
This is a real-time audio streaming and translation system consisting of:
1. OBS Plugin (C++)
2. Browser Extension (JavaScript/TypeScript)
3. Signaling Server (Node.js)

## Code Guidelines

### OBS Plugin (C++)
- Follow OBS plugin development best practices
- Ensure thread-safe audio processing
- Minimize latency in audio capture and encryption
- Handle WebRTC connections efficiently

### Browser Extension
- Follow Chrome/Firefox extension best practices
- Optimize audio processing for low latency
- Use Web Audio API for precise timing
- Implement efficient language switching

### Server
- Follow Node.js best practices
- Optimize WebSocket handling
- Implement secure signaling
- Handle connection scaling
