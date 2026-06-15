"""
NeuroSight Chatbot Microservice
Runs on port 8001 — separate from main FastAPI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.chatbot.rag_classifier import get_rag_classifier

app = FastAPI(title="NeuroSight Chatbot Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup
classifier = None

@app.on_event("startup")
async def startup():
    global classifier
    print("[Microservice] Loading RAG classifier...")
    classifier = get_rag_classifier()
    if classifier:
        print("[Microservice] ✅ RAG classifier ready!")
    else:
        print("[Microservice] ⚠️ RAG classifier not loaded!")

class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    context: dict = {}

class ChatResponse(BaseModel):
    reply: str
    intent: str
    is_emergency: bool

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    global classifier

    if classifier is None:
        classifier = get_rag_classifier()

    if classifier is None:
        return ChatResponse(
            reply="Chat service is not available. Please contact your doctor.",
            intent="general",
            is_emergency=False
        )

    reply, intent, is_emergency = classifier.answer(
        message=req.message,
        context=req.context,
        language=req.language
    )

    return ChatResponse(
        reply=reply,
        intent=intent,
        is_emergency=is_emergency
    )

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": classifier is not None
    }

# Run with:
# uvicorn backend.chatbot.microservice:app --port 8001