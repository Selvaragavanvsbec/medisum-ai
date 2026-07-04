"""Summarization + health-trends API routes."""
import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.auth import decode_token
from app.core.config import get_settings
from app.core.deps import current_user
from app.core.rate_limit import RateLimiter, client_key
from app.core.security import content_hash, sanitize, screen_input
from app.models.schemas import SummarizeRequest, SummaryResponse
from app.services import db, trends
from app.services.llm import summarize_report

logger = logging.getLogger("medisum.api")
settings = get_settings()
router = APIRouter()
limiter = RateLimiter(settings.RATE_LIMIT_PER_MINUTE)
_bearer = HTTPBearer(auto_error=False)


def _email_from(creds: HTTPAuthorizationCredentials | None) -> str | None:
    """Best-effort user email from an optional bearer token (summarize is open)."""
    if not creds:
        return None
    payload = decode_token(creds.credentials)
    return payload.get("sub") if payload else None


@router.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "db": await db.ping()}


@router.get("/history")
async def history():
    return {"items": await db.recent_summaries(limit=10)}


@router.post("/summarize", response_model=SummaryResponse)
async def summarize(
    payload: SummarizeRequest,
    request: Request,
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
):
    limiter.check(client_key(request))

    clean = sanitize(payload.report_text)
    screen = screen_input(clean, settings.MAX_INPUT_CHARS)
    if not screen.ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=screen.reason)

    try:
        summary = await summarize_report(clean, payload.reading_level)
    except RuntimeError as exc:  # missing API key etc.
        logger.error("LLM config error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    email = _email_from(creds)
    await db.save_summary(content_hash(clean), payload.reading_level, summary, email)

    # Guarantee required keys so the response model never 500s on a sparse LLM reply.
    summary.setdefault("overview", "Summary unavailable.")
    summary.setdefault("disclaimer", "This is not medical advice. Consult your doctor.")
    for k in ("key_findings", "abnormal_highlights", "terms_explained", "questions_for_doctor"):
        summary.setdefault(k, [])
    
    summary.setdefault("health_score", {"overall": 100, "categories": {"heart": 100, "diabetes": 100, "kidney": 100, "liver": 100, "blood": 100}})
    summary.setdefault("alerts", [])
    summary.setdefault("reminders", [])
    summary.setdefault("patient_details", {"age": "not stated", "gender": "not stated", "test_date": "not stated", "report_type": "not stated"})
    summary.setdefault("medicines", [])
    summary.setdefault("lifestyle_suggestions", [])
    summary.setdefault("risk_level", "low")
    summary.setdefault("emergency_warning", "")

    # Record numeric findings for the trends feature (only if logged in).
    if email:
        try:
            await trends.record(email, summary.get("key_findings", []))
        except Exception as exc:  # noqa: BLE001
            logger.warning("trend record failed: %s", exc)

    return summary


@router.get("/trends")
async def get_trends(user: dict = Depends(current_user)):
    """Return this user's tracked findings over time."""
    return await trends.series(user["email"])


@router.get("/reports")
async def get_user_reports(user: dict = Depends(current_user)):
    """Return this user's full historical summarized reports."""
    return {"items": await db.get_user_summaries(user["email"])}
