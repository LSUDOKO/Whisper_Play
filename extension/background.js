// Import WebRTC adapter
import adapter from 'webrtc-adapter';

// State management
let state = {
    connected: false,
    language: 'en',
    volume: 100,
    peer: null,
    signalingSocket: null,
    retryCount: 0,
    maxRetries: 5,
    retryTimeout: 2000
};

// WebSocket connection to signaling server with retry mechanism
async function connectToSignalingServer() {
    if (state.retryCount >= state.maxRetries) {
        console.error('Max retries reached for signaling server connection');
        state.connected = false;
        return;
    }

    try {
        const ws = new WebSocket('ws://localhost:8080');
        
        ws.onopen = () => {
            console.log('Connected to signaling server');
            state.retryCount = 0;
            state.connected = true;
            ws.send(JSON.stringify({
                type: 'register',
                clientType: 'viewer'
            }));
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                await handleSignalingMessage(data);
            } catch (error) {
                console.error('Error handling signaling message:', error);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from signaling server');
            state.signalingSocket = null;
            state.connected = false;
            
            // Attempt to reconnect
            state.retryCount++;
            setTimeout(() => connectToSignalingServer(), state.retryTimeout);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        state.signalingSocket = ws;
    } catch (error) {
        console.error('Error connecting to signaling server:', error);
        state.retryCount++;
        setTimeout(() => connectToSignalingServer(), state.retryTimeout);
    }
}

// Handle incoming signaling messages
async function handleSignalingMessage(data) {
    switch (data.type) {
        case 'offer':
            if (state.peer) {
                await state.peer.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await state.peer.createAnswer();
                await state.peer.setLocalDescription(answer);
                
                state.signalingSocket.send(JSON.stringify({
                    type: 'answer',
                    answer: answer
                }));
            }
            break;
            
        case 'ice-candidate':
            if (state.peer) {
                await state.peer.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
            break;
    }
}

// Initialize WebRTC peer connection
async function initializePeerConnection() {
    try {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };

        if (state.peer) {
            await state.peer.close();
        }

        state.peer = new RTCPeerConnection(config);
        console.log('Created RTCPeerConnection');
        
        state.peer.onicecandidate = (event) => {
            if (event.candidate && state.signalingSocket && state.signalingSocket.readyState === WebSocket.OPEN) {
                state.signalingSocket.send(JSON.stringify({
                    type: 'ice-candidate',
                    candidate: event.candidate
                }));
            }
        };

        state.peer.onconnectionstatechange = () => {
            console.log('Connection state:', state.peer.connectionState);
            if (state.peer.connectionState === 'connected') {
                state.connected = true;
            } else if (state.peer.connectionState === 'failed') {
                state.connected = false;
                initializePeerConnection(); // Retry connection
            }
        };

        state.peer.ondatachannel = (event) => {
            const channel = event.channel;
            console.log('Received data channel:', channel.label);
            
            channel.onopen = () => {
                console.log('Data channel opened');
            };
            
            channel.onclose = () => {
                console.log('Data channel closed');
            };
            
            channel.onerror = (error) => {
                console.error('Data channel error:', error);
            };
            
            channel.onmessage = async (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'audio') {
                        // Forward encrypted audio data to content script
                        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                        if (tabs[0]) {
                            await chrome.tabs.sendMessage(tabs[0].id, {
                                type: 'audioData',
                                data: data.payload
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error handling data channel message:', error);
                }
            };
        };

        return true;
    } catch (error) {
        console.error('Error initializing peer connection:', error);
        return false;
    }
}

// Message handling from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            switch (message.type) {
                case 'connect':
                    await connectToSignalingServer();
                    const success = await initializePeerConnection();
                    sendResponse({ success });
                    break;
                
                case 'disconnect':
                    try {
                        if (state.signalingSocket) {
                            state.signalingSocket.close();
                        }
                        if (state.peer) {
                            state.peer.close();
                            state.peer = null;
                        }
                        state.connected = false;
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Error during disconnect:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                
                case 'setLanguage':
                    try {
                        state.language = message.language;
                        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                        if (tabs[0]) {
                            await chrome.tabs.sendMessage(tabs[0].id, {
                                type: 'languageChange',
                                language: message.language
                            });
                        }
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Error setting language:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                
                case 'setVolume':
                    try {
                        state.volume = message.volume;
                        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                        if (tabs[0]) {
                            await chrome.tabs.sendMessage(tabs[0].id, {
                                type: 'volumeChange',
                                volume: message.volume
                            });
                        }
                        sendResponse({ success: true });
                    } catch (error) {
                        console.error('Error setting volume:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                    break;
                
                case 'getState':
                    sendResponse({
                        success: true,
                        connected: state.connected,
                        language: state.language,
                        volume: state.volume
                    });
                    break;
                
                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    })();
    return true; // Keep the message channel open for async responses
});
