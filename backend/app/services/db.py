"""MongoDB persistence layer (async, via Motor).

Privacy note: we deliberately do NOT store raw report text. Only a content
hash, the structured summary, and lightweight metadata are persisted, so the
database never holds identifiable patient report content in the clear.
"""
import logging
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings

logger = logging.getLogger("medisum.db")
settings = get_settings()

_client: AsyncIOMotorClient | None = None


_ping_cache: bool | None = None


def _db():
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
    return _client[settings.MONGODB_DB]


async def ping() -> bool:
    global _ping_cache
    if _ping_cache is not None:
        return _ping_cache
    try:
        await _db().command("ping")
        _ping_cache = True
        return True
    except Exception as exc:  # noqa: BLE001
        _ping_cache = False
        logger.warning("MongoDB unavailable, using in-memory fallback: %s", exc)
        return False


_mem_summaries: list[dict] = []


async def save_summary(content_hash: str, reading_level: str, summary: dict, email: str | None = None) -> None:
    """Persist a summary record (no raw report text)."""
    email = (email or "anon").lower().strip()
    doc = {
        "content_hash": content_hash,
        "reading_level": reading_level,
        "summary": summary,
        "email": email,
        "created_at": datetime.now(timezone.utc),
    }
    _mem_summaries.append(doc)
    try:
        if await ping():
            await _db().summaries.insert_one(
                {
                    "content_hash": content_hash,
                    "reading_level": reading_level,
                    "summary": summary,
                    "email": email,
                    "created_at": datetime.now(timezone.utc),
                }
            )
    except Exception as exc:  # noqa: BLE001
        # Persistence is best-effort; never fail the user request on DB error.
        logger.warning("save_summary failed: %s", exc)


async def recent_summaries(limit: int = 10) -> list[dict]:
    try:
        if await ping():
            cursor = _db().summaries.find(
                {}, {"_id": 0, "content_hash": 1, "reading_level": 1, "created_at": 1}
            ).sort("created_at", -1).limit(limit)
            return [doc async for doc in cursor]
    except Exception as exc:  # noqa: BLE001
        logger.warning("recent_summaries failed: %s", exc)
    
    return [
        {
            "content_hash": doc["content_hash"],
            "reading_level": doc["reading_level"],
            "created_at": doc["created_at"].isoformat() if hasattr(doc["created_at"], "isoformat") else str(doc["created_at"]),
        }
        for doc in sorted(_mem_summaries, key=lambda x: x["created_at"], reverse=True)
    ][:limit]


async def get_user_summaries(email: str, limit: int = 100) -> list[dict]:
    email = (email or "anon").lower().strip()
    try:
        if await ping():
            cursor = _db().summaries.find(
                {"email": email}, {"_id": 0}
            ).sort("created_at", -1).limit(limit)
            return [doc async for doc in cursor]
    except Exception as exc:
        logger.warning("get_user_summaries failed: %s", exc)
    
    return [
        {
            "content_hash": doc["content_hash"],
            "reading_level": doc["reading_level"],
            "summary": doc["summary"],
            "created_at": doc["created_at"].isoformat() if hasattr(doc["created_at"], "isoformat") else str(doc["created_at"]),
        }
        for doc in sorted(_mem_summaries, key=lambda x: x["created_at"], reverse=True)
        if doc["email"] == email
    ][:limit]
