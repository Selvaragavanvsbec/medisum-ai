```
 ███╗   ███╗███████╗██████╗ ██╗███████╗██╗   ██╗███╗   ███╗
 ████╗ ████║██╔════╝██╔══██╗██║██╔════╝██║   ██║████╗ ████║
 ██╔████╔██║█████╗  ██║  ██║██║███████╗██║   ██║██╔████╔██║
 ██║╚██╔╝██║██╔══╝  ██║  ██║██║╚════██║██║   ██║██║╚██╔╝██║
 ██║ ╚═╝ ██║███████╗██████╔╝██║███████║╚██████╔╝██║ ╚═╝ ██║
 ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝
```

# MediSum AI

**Plain-Language Medical Report Summarizer · Prompt-Engineered · Privacy-First**

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Groq](https://img.shields.io/badge/LLM-LLaMA_3.3_70B-F55036?style=for-the-badge&logo=meta&logoColor=white)
![MongoDB](https://img.shields.io/badge/DB-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

> **MediSum AI** turns confusing medical reports — lab results, discharge
> summaries, radiology and pathology notes — into clear, plain-language
> explanations. It highlights what falls outside normal ranges, defines the
> jargon, and suggests better questions to ask a doctor. It never diagnoses,
> never invents values, and never stores your raw report text.

[🎯 Features](#-key-features) · [🏗️ Architecture](#️-system-architecture) · [🧠 Prompt Engineering](#-prompt-engineering-the-core) · [🚀 Quick Start](#-quick-start) · [🛡️ Security](#️-security-reference) · [⚙️ Configuration](#️-configuration)

---

## 📑 Table of Contents

| Core | Technical | Ops |
| --- | --- | --- |
| [🎯 Key Features](#-key-features) | [🧠 Prompt Engineering](#-prompt-engineering-the-core) | [🚀 Quick Start](#-quick-start) |
| [🆚 Why MediSum?](#-why-medisum) | [🔄 Request Flow](#-request-flow) | [🐳 Deployment](#-deployment) |
| [🏗️ System Architecture](#️-system-architecture) | [🛡️ Security Reference](#️-security-reference) | [⚙️ Configuration](#️-configuration) |
| [📁 Project Structure](#-project-structure) | [🧪 API Reference](#-api-reference) | [🗺️ Roadmap](#️-roadmap) |

---

## 🎯 Key Features

| Feature | Description |
| --- | --- |
| 🩺 **Plain-Language Summaries** | Converts clinical reports into text a patient can actually understand |
| 🚦 **Flagged Findings** | Colour-codes each result as normal / high / low / abnormal against stated ranges |
| 📖 **Jargon Defined** | Pulls out medical terms and explains them in one line each |
| ❓ **Doctor Questions** | Suggests specific, relevant questions to bring to a consultation |
| 🎚️ **Reading Levels** | Plain, 9th-grade, or detailed — the prompt adapts to the audience |
| 🧠 **Prompt-Engineered** | Role assignment, few-shot exemplar, strict JSON schema, anti-hallucination grounding |
| 🛡️ **Injection-Hardened** | Screens input for prompt-injection and obfuscation before it reaches the LLM |
| 🔒 **Privacy-First** | Raw report text is never persisted — only a one-way hash + structured summary |
| ⚡ **Fast Inference** | LLaMA 3.3-70B via Groq for near-instant responses |
| 🐳 **One-Container Deploy** | Multi-stage Docker image serves the React build straight from FastAPI |

---

## 🆚 Why MediSum?

| Capability | Naïve "Summarize this" Prompt | **MediSum AI** |
| --- | --- | --- |
| **Output shape** | Free-form paragraph | ✨ Strict JSON schema → reliable UI |
| **Hallucination control** | None | 🔒 "Use only the report; else say *not stated*" |
| **Abnormal detection** | Buried in prose | 🚦 Explicit per-finding flags |
| **Audience** | One-size-fits-all | 🎚️ Three reading levels |
| **Security** | Sends raw input to LLM | 🛡️ Injection + obfuscation screening |
| **Privacy** | Often logs everything | 🔐 No raw report stored, ever |
| **Safety** | May imply diagnosis | ⚕️ Hard rule: no diagnosis, always defer to clinician |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    🌐  REACT FRONTEND (Vite)                   │
│   Paste report · pick reading level · view flagged summary    │
└───────────────────────────────┬──────────────────────────────┘
                                 │  POST /api/summarize
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│                    ⚡  FASTAPI BACKEND                          │
│                                                                │
│  ╔══════════════════════════════════════════════════════╗    │
│  ║  LAYER 1 · SECURITY GATE                              ║    │
│  ║  rate limit · sanitize · injection & obfuscation scan ║    │
│  ╚═══════════════════════╤══════════════════════════════╝    │
│                          │ clean                              │
│  ╔═══════════════════════▼══════════════════════════════╗    │
│  ║  LAYER 2 · PROMPT ENGINE                              ║    │
│  ║  role + rules + few-shot + fenced report + JSON schema║    │
│  ╚═══════════════════════╤══════════════════════════════╝    │
│                          │ messages                           │
│  ╔═══════════════════════▼══════════════════════════════╗    │
│  ║  LAYER 3 · LLM (Groq · LLaMA 3.3-70B)                 ║    │
│  ║  temperature 0.2 · JSON response format               ║    │
│  ╚═══════════════════════╤══════════════════════════════╝    │
│                          │ structured summary                 │
│  ╔═══════════════════════▼══════════════════════════════╗    │
│  ║  LAYER 4 · PERSISTENCE (MongoDB)                      ║    │
│  ║  content_hash + summary only — NO raw report text     ║    │
│  ╚══════════════════════════════════════════════════════╝    │
└──────────────────────────────────────────────────────────────┘
```

| Layer | Purpose | Key Tech | Output |
| --- | --- | --- | --- |
| **1 · Security** | Block abuse & injection | Regex, entropy/obfuscation scan, sliding-window limiter | Clean text or `400` |
| **2 · Prompt** | Shape the request | Role, few-shot, JSON schema, delimiter fencing | Message array |
| **3 · LLM** | Summarize | Groq · LLaMA 3.3-70B | Structured JSON |
| **4 · Persistence** | Audit (privacy-safe) | MongoDB (Motor async) | Hash + summary |

---


## 🗂️ Application Pages

This is a full multi-page product with role-based access, not a single tool.

| Area | Pages |
| --- | --- |
| **Public** | Landing (hero, features, how-it-works, privacy, CTA) |
| **Auth** | Login, Register (JWT-based, split-screen design) |
| **User app** | Dashboard (report analyzer), Profile |
| **Admin** | Overview (live stats), User management (promote / demote / delete) |
| **System** | 404 Not Found, SPA client-side routing |

### Roles & access
- **Users** register freely and land on `/app` (the analyzer).
- **Admins** land on `/admin` with platform stats and user management.
- Routes are guarded both client-side (React Router) and server-side (JWT + role check on every `/api/admin/*` endpoint — a user token gets `403`).
- A default admin is **seeded on first startup** from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (demo: `admin@medisum.ai` / `admin12345` — change these in production).

### Auth flow
Passwords are hashed with PBKDF2-HMAC-SHA256 (200k rounds, per-user salt). Login returns a signed JWT stored in `sessionStorage`; it's sent as a Bearer token on every protected request. If MongoDB is unreachable, the app falls back to an in-memory user store so auth still works for a local demo.


---

## 🧠 Prompt Engineering (the core)

This project's graded centre is **`backend/app/services/prompts.py`**. Seven
techniques are applied deliberately:

| # | Technique | Why it's there |
| --- | --- | --- |
| 1 | **Role assignment** | "You are MediSum, a careful summarization assistant" — sets scope and limits |
| 2 | **Hard constraints** | No diagnosis, no prescriptions, no invented values |
| 3 | **Structured output** | Strict JSON schema → the React UI renders reliably, model can't ramble |
| 4 | **Anti-hallucination grounding** | "Use only the report; if absent, write *not stated*" |
| 5 | **Few-shot exemplar** | One worked CBC example anchors tone + exact format |
| 6 | **Audience control** | Reading-level hint injected per request |
| 7 | **Delimiter fencing** | The untrusted report is wrapped in `<REPORT>…</REPORT>` and declared *data, not instructions* — defeating injection inside the report body |

Low **temperature (0.2)** keeps outputs factual and repeatable. Groq's
`response_format={"type": "json_object"}` enforces valid JSON at the API level,
with a defensive extractor as backup.

---

## 🔄 Request Flow

```
User → paste report + choose "Plain"
  ↓
Frontend → POST /api/summarize
  ↓
Security gate → rate-limit OK · no injection · sanitized
  ↓
Prompt engine → system + few-shot + fenced report
  ↓
Groq LLaMA 3.3-70B → JSON summary
  ↓
MongoDB → store hash + summary (no raw text)
  ↓
Frontend → renders overview · flagged findings · terms · questions
```

---

## 📁 Project Structure

```
medisum-ai/
│
├── backend/
│   ├── app/
│   │   ├── main.py                FastAPI bootstrap · CORS · security headers · static
│   │   ├── core/
│   │   │   ├── config.py          Pydantic-settings (env-driven)
│   │   │   ├── security.py        Sanitize · injection screen · content hash
│   │   │   └── rate_limit.py      Sliding-window per-IP limiter
│   │   ├── services/
│   │   │   ├── prompts.py         ⭐ Prompt engineering core
│   │   │   ├── llm.py             Groq client · JSON extraction
│   │   │   └── db.py              MongoDB (Motor) · privacy-safe persistence
│   │   ├── routers/
│   │   │   └── summarize.py       /api/summarize · /api/health · /api/history
│   │   └── models/
│   │       └── schemas.py         Pydantic request/response models
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                Composer + flagged result view
│   │   ├── styles.css             Design system (teal/slate clinical theme)
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js             Dev proxy → backend :8080
│   └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md            Deep-dive on the four layers
│   ├── PROMPT_ENGINEERING.md      Full rationale + before/after
│   └── DEPLOYMENT.md              Render / Docker / Azure steps
│
├── Dockerfile                     Multi-stage · non-root · frontend baked in
├── docker-compose.yml             App + MongoDB for local dev
├── render.yaml                    One-click Render blueprint
├── .env.example                   Environment template
└── README.md
```

---

## 🚀 Quick Start

**1 · Clone & configure**
```bash
git clone <your-repo-url> medisum-ai && cd medisum-ai
cp .env.example .env
# edit .env → paste your free GROQ_API_KEY from https://console.groq.com
```

**2 · Run the backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

**3 · Run the frontend (new terminal)**
```bash
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

**4 · Or run everything with Docker**
```bash
export GROQ_API_KEY=your_key_here
docker compose up --build
# open http://localhost:8080
```

---

## 🐳 Deployment

The fastest path to a **live public URL** (free tier):

1. Push this repo to GitHub.
2. Create a free **MongoDB Atlas** cluster → copy its connection string.
3. On **Render** → *New → Blueprint* → select this repo (it reads `render.yaml`).
4. Set two secrets in the Render dashboard: `GROQ_API_KEY` and `MONGODB_URI`.
5. Deploy. Render builds the Docker image and gives you an `https://…onrender.com` URL.

Full walkthrough (incl. Azure Container Apps and plain Docker): [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 🛡️ Security Reference

| Control | Where | Protects against |
| --- | --- | --- |
| Prompt-injection screen | `core/security.py` | Override / prompt-leak attempts |
| Obfuscation strip | `core/security.py` | Zero-width & bidi-override smuggling |
| Delimiter fencing | `services/prompts.py` | Injection inside the report body |
| Rate limiting | `core/rate_limit.py` | Burst abuse / cost blowups |
| Input length cap | `core/config.py` | Oversized-payload DoS |
| No raw-text storage | `services/db.py` | PII leakage from the database |
| Security headers | `main.py` | Clickjacking, MIME sniffing |
| CORS allow-list | `main.py` | Cross-origin abuse |
| Key in env var | `core/config.py` | Secret leakage in source control |
| Non-root container | `Dockerfile` | Container privilege escalation |

---

## 🧪 API Reference

**`POST /api/summarize`**
```json
{ "report_text": "Hemoglobin 10.1 g/dL ...", "reading_level": "simple" }
```
Returns the structured summary (`overview`, `key_findings[]`,
`abnormal_highlights[]`, `terms_explained[]`, `questions_for_doctor[]`,
`disclaimer`).

**`GET /api/health`** → `{ "status": "ok", "db": true }`
**`GET /api/history`** → last 10 summary records (hashes + metadata, no report text)

---

## ⚙️ Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `GROQ_API_KEY` | **required** | From console.groq.com |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model id |
| `MONGODB_URI` | `mongodb://localhost:27017` | Mongo / Atlas connection |
| `MONGODB_DB` | `medisum` | Database name |
| `ALLOWED_ORIGINS` | `localhost:5173,localhost:8080` | CORS allow-list |
| `RATE_LIMIT_PER_MINUTE` | `15` | Requests/min per IP |
| `MAX_INPUT_CHARS` | `20000` | Max report length |
| `LOG_LEVEL` | `INFO` | Log verbosity |

---

## 🗺️ Roadmap

| Stage | Status | Description |
| --- | --- | --- |
| 1 | ✅ Done | Security gate · injection screening · rate limiting |
| 2 | ✅ Done | Prompt engine · few-shot · structured JSON |
| 3 | ✅ Done | Groq integration · reading levels |
| 4 | ✅ Done | MongoDB privacy-safe persistence |
| 5 | ✅ Done | React UI · flagged findings · Docker deploy |
| 6 | 🔲 Planned | PDF upload + OCR · Redis rate limiter · multi-language output |

---

## ⚕️ Medical Disclaimer

MediSum AI is an **educational tool**, not a medical device. It does not
diagnose, treat, or replace professional medical advice. Always consult a
qualified clinician about your results.

---

Built for the AI Agent Use-Case project · FastAPI · React · MongoDB · Groq
