from fastapi.websockets import WebSocketState, WebSocket
from typing import List

class SocketManager:
    def __init__(self):
        # Initialize an empty list for active connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        # Accept the WebSocket connection
        await websocket.accept()

        # Add the WebSocket to the list of active connections
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        # Remove the WebSocket from the list of active connections
        self.active_connections.remove(websocket)

    async def broadcast(self, websocket: WebSocket, data: dict):
        # Check if the WebSocket is still connected
        if websocket.client_state == WebSocketState.CONNECTED:
            # Send the data over the WebSocket
            await websocket.send_json(data)
        else:
            print("WebSocket connection is closed, cannot send message")
            