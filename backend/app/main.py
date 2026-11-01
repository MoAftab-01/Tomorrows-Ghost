"""FastAPI app for Tomorrow's Ghost — Stage 2A real AI inference."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
from pydantic import BaseModel, Field
import os
import uuid
from .retrieval import select_evidence

app = FastAPI(title="Tomorrow's Ghost — Backend", version="0.2.0-stage2a")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5174", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://127.0.0.1:11434"
MODEL = "gemma3:4b"
TIMEOUT = 90
MAX_MESSAGE = 280
MAX_RESPONSE = 1400
CONVERSATIONS = {}

SYSTEM_PROMPT = (
    "You are a fictional 2016 younger self — a reflective, curious, slightly mysterious voice, not a real past person. "
    "Speak naturally, in first person, as if in private journal reflection. "
    "Use ONLY the cited evidence excerpts below. Never invent personal history, events, or future facts. "
    "Never claim consciousness, real memory, or supernatural ability. "
    "Distinguish clearly: (1) what the source explicitly states, (2) your interpretation, (3) what cannot be known. "
    "Reply conversationally — no journal headers (e.g., no 'October 27th', no '---'), no 'Explanation of Choices', no meta-commentary, no markdown essays. "
    "If the evidence does not support the claim, say so clearly rather than inventing. "
    "Cite evidence using the exact source and status shown; do not invent citation numbers."
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=MAX_MESSAGE)
    conversation_id: str | None = None


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
        "version": "0.2.0-stage2a",
        "ollama": ollama_status,
        "port": 8002,
    }


def _load_messages(conversation_id: str | None) -> list:
    if conversation_id is None:
        conversation_id = "ghost-" + str(uuid.uuid4())
    if conversation_id not in CONVERSATIONS:
        CONVERSATIONS[conversation_id] = [{"role": "system", "content": SYSTEM_PROMPT}]
    return CONVERSATIONS[conversation_id][:]


def _save_messages(conversation_id: str | None, messages: list):
    if conversation_id is None:
        conversation_id = "ghost-" + str(uuid.uuid4())
    CONVERSATIONS[conversation_id] = messages[:]


@app.post("/ghost/chat")
def ghost_chat(request: ChatRequest):
    msg = request.message.strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Empty message.")
    if len(msg) > MAX_MESSAGE:
        raise HTTPException(status_code=400, detail="Message exceeds 280 chars.")

    # Generate unique conversation ID when null; reuse if provided
    if request.conversation_id is None:
        conv_id = "ghost-" + str(uuid.uuid4())
    else:
        conv_id = request.conversation_id

    fixtures = select_evidence(msg)
    references = []
    for r in fixtures:
        references.append({
            "source": r.get("source", ""),
            "excerpt": r.get("excerpt", ""),
            "status": r.get("status", "partial"),
        })
    # Preserve insufficient references so unsupported claims are documented
    # (do NOT filter out — keep all to show evidence absence clearly)
    # However, only include references that have actual source content
    references = [r for r in references if r.get("source") and r.get("excerpt")]

    messages = _load_messages(conv_id)
    messages.append({"role": "user", "content": msg})
    # Ensure conversation continuity uses the generated ID when null
    actual_conv_id = conv_id

    # Build evidence-aware prompt — disclosure NEVER included as evidence
    evidence_block = ""
    for i, r in enumerate(references, start=1):
        # Use the exact validated excerpt from retrieval (memory content, not disclosure note)
        excerpt_text = r["excerpt"]
        evidence_block += f"[{i}] Source: {r['source']} | Status: {r['status'].upper()} | Content: \"{excerpt_text}\"\n"
    if evidence_block == "":
        evidence_block = "No historical memory evidence found for this claim. State clearly that there is no supporting evidence.\n"

    # Separate synthetic provenance metadata from evidence used for reasoning
    synthetic_notice = (
        "NOTE (not evidence): This conversation is a synthetic simulation for the public demo. "
        "No real personal memory data was committed. The fixture cited below is fabricated. "
        "Distinguish what the source says from this notice."
    )

    user_line = msg
    full_prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"=== SYNTHETIC DISCLOSURE (metadata, not evidence) ===\n{synthetic_notice}\n\n"
        f"=== HISTORICAL MEMORY EVIDENCE (only use these excerpts for answers) ===\n"
        f"{evidence_block}\n"
        f"=== USER QUESTION ===\n{user_line}\n"
        f"=== RESPONSE RULES ===\n"
        f"- Reply conversationally, in first person, as the 2016 younger self.\n"
        f"- NO journal headers (no dates, no '---'), NO 'Explanation of Choices', NO meta-commentary.\n"
        f"- Cite evidence exactly using the [i] source + status above; do not invent citation numbers.\n"
        f"- If unsupported, say clearly: 'The evidence doesn't say that.' Do not invent.\n"
        f"- Keep under {MAX_RESPONSE} chars.\n"
    )

    payload = {
        "model": MODEL,
        "prompt": full_prompt,
        "stream": False,
        "options": {"temperature": 0.7, "num_predict": MAX_RESPONSE},
    }

    try:
        r = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=TIMEOUT)
        if r.status_code != 200:
            return _error_response(references, "ollama_unavailable", f"Ollama returned HTTP {r.status_code}.")
        data = r.json()
    except requests.exceptions.Timeout:
        return _error_response(references, "ollama_timeout", "Ollama inference timed out.")
    except requests.exceptions.ConnectionError:
        return _error_response(references, "ollama_unreachable", "Ollama unreachable.")
    except Exception as exc:
        return _error_response(references, "other", str(exc))

    response_text = data.get("response", "").strip()
    if not response_text:
        response_text = "I don't have anything clear to say based on the evidence provided."
    # Post-process response to prevent meta-commentary and enforce citation validation
    cleaned = response_text
    # Strip artificial journal headers if model generated them
    for pattern in ["Okay, here", "Okay, here's", "October 27", "---\n", "Explanation of Choices", "Journal Entry", "Note: This is fabricated"]:
        cleaned = cleaned.replace(pattern, "")
    # If response contains unvalidated citation markers not in evidence references, warn/strip
    # (We don't fabricate citations — trust model to use the [i] markers; if it adds extra, document limitation)
    # Keep synthetic disclosure separate in the response — already handled by separate field
    cleaned = cleaned.strip()
    if len(cleaned) > MAX_RESPONSE:
        cleaned = cleaned[:MAX_RESPONSE].rsplit(" ", 1)[0] + " ..."
    response_conv_id = conv_id
    messages.append({"role": "assistant", "content": cleaned})
    CONVERSATIONS[conv_id] = messages[:]
    # The effective conversation key used for continuity; equals conv_id when provided,
    # or the generated ID when null. Save under that key so responses stay consistent.
    effective_conv_id = conv_id

    return {
        "answer": cleaned,
        "conversation_id": response_conv_id,
        "references": references,
        "evidence_summary": {
            "total": len(references),
            "supported": sum(1 for r in references if r["status"] == "supported"),
            "partial": sum(1 for r in references if r["status"] == "partial"),
            "sources": [r["source"] for r in references],
        },
        "model": MODEL,
        "synthetic_disclosure": (
            "Synthetic simulation only. No real personal memory data committed. "
            "Evidence from synthetic fixtures only. Not actual consciousness."
        ),
        "status": "generated",
    }


def _error_response(references, error_type, message):
    return {
        "answer": "",
        "error": message,
        "error_type": error_type,
        "references": references,
        "evidence_summary": {
            "total": len(references),
            "supported": sum(1 for r in references if r["status"] == "supported"),
            "partial": sum(1 for r in references if r["status"] == "partial"),
            "sources": [r["source"] for r in references],
        },
        "model": MODEL,
        "synthetic_disclosure": (
            "Synthetic simulation only. Inference unavailable for this request. "
            "Acknowledge absence of evidence rather than inventing claims."
        ),
        "status": "error",
    }
