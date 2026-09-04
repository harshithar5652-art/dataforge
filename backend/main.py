import base64
import os
import requests
from fastapi.responses import Response
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="VoiceFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
RIME_API_KEY = os.getenv("RIME_API_KEY")

RIME_URL = "https://users.rime.ai/v1/rime-tts"
RIME_SPEAKER = "clementine"
RIME_MODEL = "coda"
RIME_LANGUAGE = "eng"
def text_to_speech(text):
    headers = {
        "Accept": "audio/mpeg",
        "Authorization": f"Bearer {RIME_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "text": text,
        "speaker": RIME_SPEAKER,
        "modelId": RIME_MODEL,
        "lang": RIME_LANGUAGE
    }

    response = requests.post(
        RIME_URL,
        headers=headers,
        json=payload
    )

    response.raise_for_status()

    return response.content


@app.get("/")
def home():
    return {
        "message": "VoiceFlow backend is running!",
        "status": "success"
    }


class VoiceRequest(BaseModel):
    text: str
    session_id:str



conversation_sessions = {}



    
def generate_response(text, session_id):
    if session_id not in conversation_sessions:
        conversation_sessions[session_id] = []

    history = conversation_sessions[session_id]

    history.append({
        "user": text
    })

    text_lower = text.lower()

    if "hello" in text_lower or "hi" in text_lower:
        response = "Hello! Welcome to VoiceFlow."

    elif "help" in text_lower:
        response = "Sure! Tell me what you need help with."

    elif "college" in text_lower:
        response = "I can help you with college-related information."

    elif "dataforge" in text_lower:
        response = "VoiceFlow is our voice assistant project for the DataForge Hackathon."

    elif "library" in text_lower:
        previous_messages = " ".join(
            item["user"] for item in history[:-1]
        ).lower()

        if "college" in previous_messages:
            response = "The library is part of the college context you mentioned. I can help you with library-related information."
        else:
            response = "Sure, I can help with library-related information."

    else:
        response = f"I understood your request: {text}"

    history[-1]["assistant"] = response

    return response
@app.post("/voice")
def process_voice(request: VoiceRequest):
    text = request.text
    response = generate_response(text, request.session_id)

    audio = text_to_speech(response)

    return {
        "response": response,
        "audio": base64.b64encode(audio).decode("utf-8")
    }