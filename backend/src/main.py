import logging
import asyncio
import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from src.whispers_session import WhispersSession
from src.socket_manager import SocketManager

# Initialize the FastAPI app
app = FastAPI()

# Initialize a logger to log any errors that occur
logger = logging.getLogger(__name__)

# Initialize the dictionaries for storing socket managers, queues and whisperings
socketManagers = {}
queues = {}
whisperings = {}


def generate_unique_id():
    # Generate and return a unique ID
    return str(uuid.uuid4())


@app.websocket("/")
async def whispers(websocket: WebSocket):
    # Add try-except block to handle any exceptions that occur
    try:
        # Generate a unique ID for the client
        user_id = generate_unique_id()

        # Initialize a queue for storing transcription data and another for storing AI responses
        queues[user_id + "transcription"] = asyncio.Queue()
        queues[user_id + "reasoning"] = asyncio.Queue()

        # Initialize a SocketManager for the client
        socketManagers[user_id] = SocketManager()

        # Initialize a Whispers Repository for the client
        whisperings[user_id] = WhispersSession(
            queues[user_id + "transcription"], queues[user_id + "reasoning"], socketManagers[user_id])

        # Connect the WebSocket
        await socketManagers[user_id].connect(websocket)

        # Send a message to all connected clients to indicate that a new connection has been established
        response = {
            "status": "connection_established"
        }
        await socketManagers[user_id].broadcast(websocket, response)

        while True:
            # Receive audio data from the WebSocket connection
            recording = await websocket.receive_json()
            recording = recording['audio_data']

            # Put the audio data in the transcription queue
            await queues[user_id + "transcription"].put(recording)

            # Create a task to process the audio data from the queue
            whisper_task = asyncio.create_task(
                whisperings[user_id].process_audio_data_from_queue(websocket))

            # # Create a task to get the AI response
            response_task = asyncio.create_task(
                whisperings[user_id].get_ai_response(websocket))

    except WebSocketDisconnect:
        # Disconnect the WebSocket and broadcast a message to all connected clients
        socketManagers[user_id].disconnect(websocket)
        queues.pop(user_id + "transcription")
        queues.pop(user_id + "reasoning")
        whisperings.pop(user_id)
        response["status"] = "left"
        await socketManagers[user_id].broadcast(websocket, response)
    except Exception as e:
        # Log any errors that occur
        logger.exception(e)


async def main():
    # Start the audio data processing task
    # Start the websocket server
    await app.run()

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    asyncio.run(main())
