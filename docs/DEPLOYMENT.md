# Deployment Guide

You need two things before deploying: a **Groq API key**
(https://console.groq.com, free) and a **MongoDB connection string**
(MongoDB Atlas free tier works well).

---

## Option A — Render (recommended, free, ~5 min)

Render reads the included `render.yaml` blueprint and builds the Docker image
for you.

1. Push this repository to GitHub.
2. Create a free MongoDB Atlas cluster:
   - atlas.mongodb.com → build a free M0 cluster
   - Database Access → add a user
   - Network Access → allow `0.0.0.0/0` (or Render's IPs)
   - Copy the `mongodb+srv://…` connection string
3. On https://render.com → **New → Blueprint** → connect your repo.
4. Render detects `render.yaml`. Fill in the two secret env vars when prompted:
   - `GROQ_API_KEY` = your Groq key
   - `MONGODB_URI` = your Atlas connection string
5. Click **Apply**. Render builds and deploys; you get a public
   `https://medisum-ai.onrender.com` URL.

> Free instances sleep after inactivity and cold-start in ~30s. Fine for a demo.

---

## Option B — Docker (any VPS or local)

```bash
# 1. Set your key
export GROQ_API_KEY=your_key_here

# 2. Build + run app and MongoDB together
docker compose up --build -d

# 3. Open
http://localhost:8080
```

To deploy on a VPS, point a domain at the host, run the same compose file, and
put Nginx or Caddy in front for TLS.

---

## Option C — Azure Container Apps

```bash
# Build and push to Azure Container Registry
az acr build --registry <your-registry> --image medisum:latest .

# Create the container app
az containerapp create \
  --name medisum-ai \
  --resource-group <rg> \
  --image <your-registry>.azurecr.io/medisum:latest \
  --target-port 8080 --ingress external \
  --env-vars GROQ_API_KEY=secretref:groq MONGODB_URI=secretref:mongo
```

Store `GROQ_API_KEY` and `MONGODB_URI` as Container App secrets first.

---

## Post-deploy checklist

- [ ] `GET /api/health` returns `{"status":"ok","db":true}`
- [ ] The homepage loads and the "Try a sample CBC" button works
- [ ] `ALLOWED_ORIGINS` includes your live domain (or `*` for a public demo)
- [ ] `.env` is **not** committed (it's in `.gitignore`)

---

## Security reminder

Never hard-code `GROQ_API_KEY` in the source or commit `.env`. All secrets are
read from environment variables so they can be rotated without a code change.
