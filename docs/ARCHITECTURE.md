# Architecture

MediSum AI is a four-layer request pipeline behind a single-page React app.

## Overview

```
React (Vite)  ──POST /api/summarize──►  FastAPI
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    ▼                     ▼                     ▼
              Security gate         Prompt engine          Persistence
            (screen + limit)      (Groq LLaMA 3.3)        (MongoDB, hash)
```

## Layer 1 — Security gate (`core/security.py`, `core/rate_limit.py`)

Every request first passes a per-IP sliding-window rate limiter. The report
text is then sanitized (obfuscation characters stripped) and screened for
prompt-injection patterns. Anything suspicious returns `400` before a single
token is sent to the LLM — this saves cost and blocks abuse.

## Layer 2 — Prompt engine (`services/prompts.py`)

Assembles the system prompt, the few-shot exemplar, and the fenced user report
into a message array. See [`PROMPT_ENGINEERING.md`](PROMPT_ENGINEERING.md).

## Layer 3 — LLM (`services/llm.py`)

An async Groq client calls LLaMA 3.3-70B with `temperature=0.2` and JSON
response format. The response is parsed into a Python dict, with a defensive
extractor to handle any non-clean output.

## Layer 4 — Persistence (`services/db.py`)

The summary and a **one-way SHA-256 hash** of the report are stored in MongoDB
via the async Motor driver. The raw report text is deliberately never written —
so even a full database compromise exposes no patient report content. All DB
writes are best-effort: a database outage never fails the user's request.

## Frontend (`frontend/src/App.jsx`)

A single React component holds the composer (textarea + reading-level toggle)
and renders the structured response: an overview card, colour-coded finding
cards, an "what stands out" list, defined terms, and suggested doctor
questions. The design system lives in `styles.css`.

## Deployment shape

A multi-stage Dockerfile builds the React app, then copies the static bundle
into the Python image. FastAPI serves both the API (`/api/*`) and the SPA
(`/`), so the entire product ships as **one container** on one URL.

## Scaling notes

The in-memory rate limiter is per-instance. For horizontal scaling, replace it
with a Redis-backed limiter (listed in the roadmap). The LLM and MongoDB calls
are already async, so a single instance handles concurrent requests well.
