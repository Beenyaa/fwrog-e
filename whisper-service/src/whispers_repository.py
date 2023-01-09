import base64
import os
from dotenv import load_dotenv
import numpy as np
import openai
from asgiref.sync import sync_to_async
from src.whispers_engine import process_audio_data

# Load the environment variables
load_dotenv()


class WhispersRepository:

    def __init__(self, transcriptionQueue, reasoningQueue, socketManager):
        self.transcriptionQueue = transcriptionQueue
        self.reasoningQueue = reasoningQueue
        self.socketManager = socketManager
        self.froggySession = False

    def __base64_to_narray(self, convertible):
        # Convert the string to a bytes object
        convertible = base64.b64decode(convertible)

        # Convert the bytes object to a NumPy array
        convertible = np.frombuffer(convertible, np.int16).flatten().astype(
            np.float32)*(1/32768.0)

        return convertible

    async def process_audio_data_from_queue(self, websocket):
        while True:
            # Get audio data from the queue
            recording = await self.transcriptionQueue.get()

            # Process the audio data and broadcast the transcription result
            recording = self.__base64_to_narray(recording)
            transcription = await process_audio_data(recording)
            if transcription is not None:
                data = {
                    "status": "broadcasting",
                    "transcription": transcription,
                }
                await self.reasoningQueue.put(transcription)
                await self.socketManager.broadcast(websocket, data)
            self.transcriptionQueue.task_done()

    async def get_ai_response(self, websocket):
        # Set the API key for OpenAI
        openai.api_key = os.getenv("OPENAI_API_KEY")
        # Get the prompt for the OpenAI model
        prompt = os.getenv("OPENAI_PROMPT")

        # Get the transcription from the queue
        transcription = await self.reasoningQueue.get()

        # Use the OpenAI API to get a response for the transcription
        response = await sync_to_async(openai.Completion.create)(
            model="text-davinci-003",
            prompt=f"{prompt}Q: {transcription}\nA: ",
            temperature=0,
            max_tokens=100,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            stop=["\n"]
        )
        if response:
            data = {
                "status": "broadcasting",
                "reasoning": response.choices[0].text.strip(),
            }
            await self.socketManager.broadcast(websocket, data)
        self.reasoningQueue.task_done()
