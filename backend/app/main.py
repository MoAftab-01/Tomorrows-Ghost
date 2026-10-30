from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="Tomorrow's Ghost — Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://127.0.0.1:11434"


@app.get("/health")
def health():
    ollama_status = "unknown"
    try:
        r = requests.get(f"{OLLAMA_URL}/api/ps", timeout=2)
        ollama_status = "connected" if r.status_code == 200 else "unreachable"
    except Exception:
        ollama_status = "unreachable"
    return {
        "status": "ok",
        "service": "tomorrows-ghost-backend",
        "version": "0.1.0-stage1",
        "ollama": ollama_status,
        "port": 8002,
    }


@app.get("/ollama-check")
def ollama_check():
    try:
        r = requests.get(f"{OLLAMA_URL}/api/ps", timeout=2)
        return {"ollama_reachable": r.status_code == 200, "models": r.json().get("models", [])}
    except Exception as e:
        return {"ollama_reachable": False, "error": str(e)}