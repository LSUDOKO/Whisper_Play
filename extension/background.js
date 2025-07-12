// State management
let state = {
    connected: false,
    language: 'en',
    volume: 100,
    peer: null,
    signalingSocket: null
};

// WebSocket connection to signaling server
function connectToSignalingServer() {
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
        console.log('Connected to signaling server');
        ws.send(JSON.stringify({
            type: 'register',
            clientType: 'viewer'
        }));
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        handleSignalingMessage(data);
    };

    ws.onclose = () => {
        console.log('Disconnected from signaling server');
        state.signalingSocket = null;
        state.connected = false;
    };

    state.signalingSocket = ws;
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
function initializePeerConnection() {
    const config = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };

    const peer = new RTCPeerConnection(config);
    
    peer.onicecandidate = (event) => {
        if (event.candidate && state.signalingSocket) {
            state.signalingSocket.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate
            }));
        }
    };

    peer.ondatachannel = (event) => {
        const channel = event.channel;
        channel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'audio') {
                // Forward encrypted audio data to content script
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            type: 'audioData',
                            data: data.payload
                        });
                    }
                });
            }
        };
    };

    state.peer = peer;
}

// Message handling from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'connect':
            connectToSignalingServer();
            initializePeerConnection();
            sendResponse({ success: true });
            break;
            
        case 'disconnect':
            if (state.signalingSocket) {
                state.signalingSocket.close();
            }
            if (state.peer) {
                state.peer.close();
                state.peer = null;
            }
            state.connected = false;
            sendResponse({ success: true });
            break;
            
        case 'setLanguage':
            state.language = message.language;
            // Notify content script of language change
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'languageChange',
                        language: message.language
                    });
                }
            });
            break;
            
        case 'setVolume':
            state.volume = message.volume;
            // Notify content script of volume change
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'volumeChange',
                        volume: message.volume
                    });
                }
            });
            break;
            
        case 'getState':
            sendResponse({
                connected: state.connected,
                language: state.language,
                volume: state.volume
            });
            break;
    }
    
    return true; // Keep the message channel open for async responses
});
