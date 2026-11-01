# Tomorrow's Ghost — Meet the Person You Used to Be

*A cinematic, haunting, nostalgic AI experience. Ask your younger self what they believed — before life proved them wrong.*

**Project:** Tomorrow's Ghost
**Ghost in the Machine — Hacktoberfest 2026**
**Status:** Local demo (Stage 1 + Stage 2A). Stage 2B is **not implemented** and is not claimed.
**Inference:** Runs locally via Ollama (`gemma3:4b`). No public hosting.

---

## Opening story

> "What if you could ask your younger self what they believed before life proved them wrong?"

Tomorrow's Ghost is a fictional 2016 younger self — a reflective, curious, slightly mysterious voice you can talk to in the Ghost Chamber. It doesn't claim to be your real past, your actual memories, or anything supernatural. It's a synthetic simulation grounded in local memory evidence, designed to feel hauntingly intimate while staying honest about its limits.

---

## Concept: Ghost in the Machine

The project fits Hacktoberfest Week 4 "Ghost in the Machine" by surfacing a voice from stored memory fragments — a ghost made of evidence, not of real personal data. It asks: if all we had of our younger self were a few notes, what kind of person would they seem to be?

- **70% haunting, 30% nostalgic** — the tone lingers on uncertainty and quiet reflection rather than cheerful retrospection.
- No journal headers, no "Explanation of Choices," no markdown essays — just conversational first-person prose.
- Every answer cites its source evidence with an explicit status: **supported**, **partial**, or **insufficient**.

---

## Features actually implemented

| Area | Implemented |
|------|-------------|
| Chat interface | Ghost Chamber with message bubbles, evidence display, loading state, keyboard Enter-to-send |
| Backend | FastAPI `POST /ghost/chat`, `GET /health` |
| AI inference | Local Ollama, `gemma3:4b`, non-streaming |
| Conversation IDs | Unique `ghost-<uuid>` when `conversation_id` is null; reuse when provided |
| Continuity | Same `conversation_id` shares message history |
| Isolation | Different `conversation_id` values keep separate stores |
| CORS | `localhost:5174` and `127.0.0.1:5174` preflight `200` + matching origin header |
| Retrieval | Synthetic fixture `fixture_memory_2016.md`, keyword-overlap selection |
| Evidence status | `supported` / `partial` / `insufficient` |
| Synthetic disclosure | Shown in every response; clearly separated from evidence |
| Prompt-injection guard | System prompt binds the model to evidence; memory text never treated as instructions |

**Not implemented (roadmap, Stage 2B — explicitly not part of this release):** persistent conversation DB, authentication, future time capsule, public hosting of Ollama, streaming UI.

---

## Architecture & technology stack

```
Frontend   React + Vite + TypeScript + Tailwind (port 5174)
Backend    FastAPI + Python 3.10 + uvicorn (port 8002)
AI         Ollama local, gemma3:4b (port 11434)
Retrieval  Synthetic fixture memory (fixture_memory_2016.md)
```

Data flow:

1. User types a message in the Ghost Chamber (frontend).
2. Frontend sends `POST /ghost/chat` to the FastAPI backend.
3. Backend selects evidence from the synthetic fixture via the retrieval layer.
4. Backend builds a prompt where evidence and synthetic disclosure are separated from the system rules.
5. Ollama (`gemma3:4b`) generates the response locally.
6. Backend strips meta-artifacts, caps length, saves to the in-memory conversation store, returns `answer` + `conversation_id` + `references` + `evidence_summary` + `synthetic_disclosure`.

---

## How Ollama and Gemma power the experience

Inference runs **locally** on your machine through Ollama (`http://127.0.0.1:11434`) using `gemma3:4b`. The backend sends a single non-streaming `POST /api/generate` request and waits for the full response before cleaning it. No external model provider is called, no API key is required, and nothing is sent off your machine.

**Important:** Because Ollama runs locally, there is no functioning public AI demo to host. A static frontend alone would not work. If you want to see it live, run it locally (see below).

---

## Evidence grounding & limitations

Every reference points to a real excerpt from the synthetic fixture — no fabricated citations, no confidence percentages.

- **Supported** — direct factual claim explicitly stated in the source (e.g., "I believed technology could fix loneliness").
- **Partial** — inference, emotion, fear, or motivation suggested by but not explicitly stated in the source (e.g., "were you afraid of being alone?").
- **Insufficient** — query is unrelated to the fixture content (e.g., pet's name); the model acknowledges absence rather than inventing.

**Limitations:**

- Conversation store is ephemeral, in-memory only — resets on server restart.
- No authentication (out of scope for Stage 2A).
- One synthetic fixture only; additional fixtures would be picked up automatically but aren't added.
- Real-model integration means answers depend on local Ollama availability and are not identical on every run.
- No public demo hosted — local Ollama cannot be safely exposed to the public internet.
- No automated browser tests (manual verification step documented in STAGE_2A_CHECKPOINT.md).

---

## Privacy & synthetic-data disclosure

No real personal memory data was committed. The fixture cited below is fabricated for demonstration. The synthetic disclosure appears in every response:

> "Synthetic simulation only. No real personal memory data committed. Evidence from synthetic fixtures only. Not actual consciousness."

---

## Local installation & startup

```powershell
# 1. Clone or open the project
cd E:\placement_personal\Projects\Tomorrows-Ghost

# 2. Start Ollama (local, port 11434) and confirm gemma3:4b is available
#    ollama serve
#    ollama pull gemma3:4b

# 3. Start the backend (port 8002)
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8002

# 4. Start the frontend (port 5174) — new terminal
cd ../frontend
npm install
npm run dev -- --port 5174 --host

# 5. Open http://localhost:5174, go to Ghost Chamber, type a message
```

Example questions to try:

- "What did I believe about the future in 2016?" (supported)
- "What did I believe technology could fix?" (supported)
- "Were you afraid of being alone in 2016?" (partial)
- "What was my pet's name?" (insufficient — no evidence)

---

## Testing evidence

Backend test suite (`python -m pytest backend/tests/test_chat.py backend/tests/test_retrieval.py`):

- **19 passed**, 0 failed — covering health, empty/oversized input, real inference, unsupported claims, isolation, continuity, prompt-injection guard, CORS origins, unique/null conversation IDs, and the three evidence-classification regressions (direct → supported, fear → partial, pet → insufficient).

**Prompt-injection behavior:** The existing regression checks verify that memory text is treated as untrusted data, but they are **not** comprehensive security validation. Do not claim comprehensive security validation.

---

## Development notes (honest)

- The original prompt-injection test used an overly broad substring (`"was"`) that matched normal prose ("it wasn't"). It was replaced with precise identity-change directives only.
- Early server restarts left a stale cached instance returning `"default"` instead of a unique `ghost-<uuid>`. Fixed by restarting only the verified PID with `PYTHONDONTWRITEBYTECODE=1` and `python -B`.
- Evidence classification was split into direct vs. interpretive support so fears/emotions are correctly marked `partial`.

---

## Hacktoberfest attribution

Built for **Hacktoberfest 2026 Week 4 — Ghost in the Machine**.
The official deadline (October 31, 2026, 11:59 PM PDT) has passed; this is a **post-deadline** public release. No contest eligibility is claimed.

---

## Future roadmap (unimplemented)

- Persistent conversation database
- Authentication
- Future time capsule feature
- Public demo hosting
- Streaming UI
- Additional synthetic fixtures

---

## Attribution

Development assisted by Claude Code. Third-party software: React, Vite, TypeScript, Tailwind CSS, FastAPI, Ollama, gemma3:4b, uvicorn, pytest, and the Python standard library.