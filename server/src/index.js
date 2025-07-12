const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, { ws, type: null });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'register':
                    clients.get(clientId).type = data.clientType; // 'streamer' or 'viewer'
                    break;
                    
                case 'offer':
                    // Forward offer to all viewers
                    broadcastToViewers(data, clientId);
                    break;
                    
                case 'answer':
                    // Forward answer to streamer
                    forwardToStreamer(data);
                    break;
                    
                case 'ice-candidate':
                    // Forward ICE candidate
                    forwardIceCandidate(data, clientId);
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(clientId);
    });
});

function broadcastToViewers(data, senderId) {
    for (const [id, client] of clients.entries()) {
        if (id !== senderId && client.type === 'viewer') {
            client.ws.send(JSON.stringify(data));
        }
    }
}

function forwardToStreamer(data) {
    for (const [_, client] of clients.entries()) {
        if (client.type === 'streamer') {
            client.ws.send(JSON.stringify(data));
            break;
        }
    }
}

function forwardIceCandidate(data, senderId) {
    for (const [id, client] of clients.entries()) {
        if (id !== senderId) {
            client.ws.send(JSON.stringify(data));
        }
    }
}

console.log('WebRTC signaling server running on port 8080');
