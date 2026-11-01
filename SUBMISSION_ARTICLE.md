---
title: "I Built an AI Ghost That Lets You Talk to Your 2016 Self 👻"
description: "A local-first, evidence-grounded AI that roleplays a fictional younger self — with honest limits, synthetic disclosure, and no fabricated memories."
tags: [devchallenge, ai, open-source, hacktoberfest, local-first, ollama, fastapi]
canonical_url: https://github.com/MoAftab-01/Tomorrows-Ghost
published: false
cover_image: null
---

> **Note on timing:** Hacktoberfest 2026 Week 4 ("Ghost in the Machine") had an official deadline of October 31, 2026, 11:59 PM PDT. Today is November 1, 2026. This article is published after that deadline. No contest eligibility is claimed, and no submission was attempted after closure. The repository and article are shared as an honest open-source demo.

---

## Opening

> "What if you could ask your younger self what they believed before life proved them wrong?"

That's the question behind **Tomorrow's Ghost**. It isn't a chatbot pretending to know your past. It's a fictional 2016 younger self — a voice built from evidence fragments — that talks back with reflection, uncertainty, and a touch of mystery.

---

## Why I built this

I wanted something that felt **haunting and nostalgic**, not cheerful-retrospective. The design targets about 70% haunting, 30% nostalgic: the tone lingers on doubt, not celebration.

More importantly, I wanted to show that you can build emotionally resonant AI **without inventing memories**. The evidence layer selects real excerpts from a synthetic fixture. The model must cite them — and when there's no support, it says so clearly.

---

## How it fits Ghost in the Machine

The Week 4 theme asks for technology that surfaces something hidden — a ghost made of data, not a physical presence. Tomorrow's Ghost does that: a voice that exists only in the conversation storage (ephemeral, in-memory), grounded in the synthetic memory excerpt from `fixture_memory_2016.md`. It's not a real person's past, but it behaves like a real conversation while being fully transparent about being simulated.

---

## The design: evidence first, not content first

Most conversational AI builds a persona from a system prompt and lets the model invent freely. This design does the opposite:

1. The user asks something.
2. Retrieval selects relevant fixture evidence.
3. The prompt separates **system rules** from **evidence** from **synthetic disclosure** — clearly, never interleaved.
4. The model answers only with what the evidence supports.
5. References show `supported` / `partial` / `insufficient` — never a fake confidence score.

This isn't a security mechanism (the existing checks verify structural separation, not comprehensive protection), but it does prevent the model from inventing a personal history when there's nothing in the source.

---

## How it works — architecture

```
Frontend   React + Vite + TypeScript + Tailwind → port 5174
Backend    FastAPI + Python 3.10 + uvicorn → port 8002
AI         Ollama (local) → gemma3:4b → port 11434
Retrieval  Synthetic fixture memory → keyword-overlap selection
```

The backend builds a prompt where evidence excerpts are embedded with their source and status, the synthetic disclosure is clearly marked `(metadata, not evidence)`, and the model is instructed to reply conversationally — no journal headers, no meta-commentary.

---

## Real inference with local Gemma

The model runs locally. No API keys, no external calls, no hidden data transmission. The backend sends one non-streaming `POST /api/generate`, waits for the full response, then strips meta-artifacts (`"Okay, here"`, journal headers, fabricated citations) before returning.

Example live results (verified after fresh server restart with `PYTHONDONTWRITEBYTECODE=1` + `python -B`):

- "What did I believe technology could fix?" → `supported` — direct claim from fixture.
- "Were you afraid of being alone in 2016?" → `partial` — emotion suggested by context, not explicitly stated.
- "What was my pet's name?" → `insufficient` — unrelated; model acknowledges absence rather than inventing.

---

## Fixing things honestly

A few concrete fixes went into this release — not hidden, not glossed over:

**Evidence classification fix:** The retrieval layer initially labeled emotional/fear questions as `supported`. It now distinguishes direct factual claims (explicit in source → supported) from interpretive inference (suggested but not explicit → partial).

**Stale server instance:** A previous server restart left a cached module returning `"default"` for null conversation IDs. I confirmed the source was correct and fixed it by stopping only the verified PID (`12300`) and restarting with fresh bytecode disabled.

**Overbroad assertion:** A regression test checked `assert "was" not in ans`. It matched normal prose ("it wasn't"). Replaced with precise identity-change directives only (`became`, `got`, `turn into`, `you are now`). Added a deterministic mock test for structural protection.

---

## What went wrong (and how I handled it)

The development wasn't clean — it shouldn't be presented as clean. Early attempts to fix a stale server accidentally ran commands in wrong directories. The retrieval logic needed a direct-vs-interpretive split. The prompt-injection guard needed tightening, not deleting.

What I did: verified the source file directly, confirmed with independent simulation (not relying on a potentially stale server), then restarted only after confirming the verified PID was killed. Every change is visible in the diff.

---

## Why local-first privacy matters

A synthetic fixture with no real data, running on your machine, with no external API — that's the point. The disclosure says clearly: no real memory committed. The model never claims consciousness. The conversation store resets when the process stops.

This isn't a feature list to impress. It's a boundary choice: if you're going to roleplay a past self, you should be explicit about the fiction.

---

## Real testing — not marketing

Backend: 19 passed, 0 failed (`pytest backend/tests/test_chat.py test_retrieval.py`).

Coverage includes: health, empty/oversized input, real inference (`gemma3:4b`), unsupported claim handling, isolation, continuity, CORS both origins, null-ID uniqueness, continuity with returned ID, prompt-injection structural guard, citation validation, and the three classification cases.

Prompts-injection checks are limited (they verify memory is not treated as instructions, not comprehensive security). I don't claim otherwise.

---

## Limitations (honest)

- No persistent DB — conversation store is ephemeral.
- No auth — out of scope for this stage.
- One synthetic fixture only.
- Real-model answers vary and depend on local Ollama.
- No public AI hosting — inference must run locally.
- No automated browser tests (manual verification documented).
- No Stage 2B functionality is present or claimed.

---

## GitHub repository

https://github.com/MoAftab-01/Tomorrows-Ghost

Branch: `main`

Commit (verified 2026-11-01): `feat: release Tomorrow's Ghost` (SHA `c79dee5b9122cc88e033dc0abcd40c791a02a003`) — pushed to https://github.com/MoAftab-01/Tomorrows-Ghost. Message contains NO "hacktoberfest" claim (honest git history); attribution lines (`Co-Authored-By: Claude Code <noreply@anthropic.com>` + `🤖 Generated with [Claude Code](https://claude.com/claude-code)`) preserved. DEV article remains `published: false`; manual publication at https://dev.to/new is the only open step — never auto-published (no auth available).

**Important:** This is a Stage 2A release. Stage 2B (persistent DB, auth, future capsule, streaming, public hosting) does not exist and is not started.

---

## How to run locally

```powershell
# Start Ollama locally (port 11434), confirm gemma3:4b loaded
# Start backend (port 8002) — from backend/ directory
python -m uvicorn app.main:app --host 127.0.0.1 --port 8002
# Start frontend (port 5174) — from frontend/ directory
npm install
npm run dev -- --port 5174 --host
# Open http://localhost:5174, go to Ghost Chamber
```

---

## Thank you / Acknowledgments

This project was developed with assistance from Claude Code. Third-party software used: React, Vite, TypeScript, Tailwind CSS, FastAPI, Ollama, gemma3:4b, uvicorn, pytest, and the Python standard library.

Special thanks to the Hacktoberfest community for the Week 4 theme — and for understanding that sometimes a project ships honestly rather than claiming more than it built.

---

*Built with care, released with honesty. The ghost you talk to isn't real — but the questions you ask it might reveal something about yourself.*
