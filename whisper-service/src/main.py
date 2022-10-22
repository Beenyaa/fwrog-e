from fastapi import (
    FastAPI, WebSocket, WebSocketDisconnect, Request, Response
)
import whisper
import os
from typing import List
os.system("pip install git+https://github.com/openai/whisper.git")

app = FastAPI()

model = whisper.load_model("large")


async def inference(audio):
    audio = whisper.load_audio(audio)
    audio = whisper.pad_or_trim(audio)

    mel = whisper.log_mel_spectrogram(audio).to(model.device)

    _, probs = model.detect_language(mel)

    options = whisper.DecodingOptions(fp16=False)
    result = whisper.decode(model, mel, options)

    print(result.text)
    return result.text


class SocketManager:
    def __init__(self):
        self.active_connections: List[(WebSocket)] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append((websocket))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove((websocket))

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            await connection[0].send_json(data)


manager = SocketManager()


@app.websocket("/")
async def transcribe(websocket: WebSocket):
    if websocket:
        await manager.connect(websocket)
        response = {
            "status": "connection established"
        }
        try:
            await manager.broadcast(response)
            while True:
                data = await websocket.receive_json()

                await inference(data)

        except WebSocketDisconnect:
            manager.disconnect(websocket)
            response['status'] = "left"
            await manager.broadcast(response)
