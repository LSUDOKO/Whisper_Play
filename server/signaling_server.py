import asyncio
import websockets
import json

# --- State Management ---
# A simple dictionary to hold our connected clients.
# In a real-world scenario, you might have more complex room management.
clients = {
    "viewer": None,
    "streamer": None
}

# --- WebSocket Handler ---
async def handler(websocket, path):
    client_type = None
    print("A client connected.")

    try:
        # The first message from any client should be a registration message.
        registration_message = await websocket.recv()
        data = json.loads(registration_message)

        if data.get('type') == 'register':
            client_type = data.get('clientType')
            if client_type in clients:
                clients[client_type] = websocket
                print(f"Registered client as '{client_type}'.")
            else:
                print(f"Unknown client type: {client_type}")
                return

        # Relay messages between the two clients.
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            
            # Determine the other party to relay the message to.
            other_client_type = "streamer" if client_type == "viewer" else "viewer"
            other_client_socket = clients.get(other_client_type)

            if other_client_socket and other_client_socket.open:
                print(f"Relaying message from '{client_type}' to '{other_client_type}': {data['type']}")
                await other_client_socket.send(json.dumps(data))
            else:
                print(f"Could not relay message: '{other_client_type}' is not connected.")

    except websockets.exceptions.ConnectionClosed:
        print(f"Connection with '{client_type}' closed.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        # Clean up on disconnect.
        if client_type and clients.get(client_type) == websocket:
            clients[client_type] = None
            print(f"Unregistered client '{client_type}'.")

# --- Server Startup ---
async def main():
    print("Starting signaling server on ws://localhost:8080")
    async with websockets.serve(handler, "localhost", 8080):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
