from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="VoiceFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "VoiceFlow backend is running!",
        "status": "success"
    }



@app.post("/voice")
def process_voice(text: str):

    text_lower = text.lower()

    if "hello" in text_lower or "hi" in text_lower:
        response = "Hello! Welcome to VoiceFlow."

    elif "help" in text_lower:
        response = "Sure! Tell me what you need help with."

    elif "college" in text_lower:
        response = "I can help you with college-related information."

    elif "dataforge" in text_lower:
        response = "VoiceFlow is our voice assistant project for the DataForge Hackathon."

    else:
        response = f"I understood your request: {text}"

    return {
        "received_text": text,
        "response": response
    }