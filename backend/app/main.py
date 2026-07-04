"""MediSum AI - FastAPI application bootstrap."""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.routers import auth, summarize
from app.services import users

settings = get_settings()
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("medisum")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle handler (replaces deprecated on_event)."""
    logger.info("MediSum AI starting up...")
    await users.ensure_admin()
    logger.info("Admin account verified. App ready.")
    yield
    logger.info("MediSum AI shutting down.")


app = FastAPI(title=settings.APP_NAME, version="2.0.0", lifespan=lifespan)

# Allow all origins listed in ALLOWED_ORIGINS (comma-separated).
# allow_credentials must be True so the browser sends Authorization headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
    return response


app.include_router(auth.router, prefix="/api")
app.include_router(summarize.router, prefix="/api")

# --- Serve the built frontend with SPA fallback routing ---
_STATIC_DIR = os.getenv("STATIC_DIR", "/app/static")
if os.path.isdir(_STATIC_DIR):
    _assets_dir = os.path.join(_STATIC_DIR, "assets")
    if os.path.isdir(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="assets")
    _INDEX = os.path.join(_STATIC_DIR, "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str):
        candidate = os.path.join(_STATIC_DIR, full_path)
        if full_path and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(_INDEX)
