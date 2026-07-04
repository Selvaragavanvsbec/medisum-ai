"""User persistence with MongoDB, plus an in-memory fallback.

If MongoDB isn't reachable (e.g. local demo without a DB), the app still works
using an in-process store so auth can be demonstrated end-to-end. History and
summaries fall back the same way.
"""
import logging
from datetime import datetime, timezone

from app.core.auth import hash_password
from app.core.config import get_settings
from app.services.db import _db, ping

logger = logging.getLogger("medisum.users")
settings = get_settings()

# In-memory fallback store (used only when Mongo is unavailable).
_mem_users: dict[str, dict] = {}


async def _use_mongo() -> bool:
    return await ping()


def _public(user: dict) -> dict:
    return {
        "id": str(user.get("_id", user.get("email"))),
        "name": user.get("name", ""),
        "email": user["email"],
        "role": user.get("role", "user"),
        "created_at": user.get("created_at"),
    }


async def get_user(email: str) -> dict | None:
    email = email.lower().strip()
    if await _use_mongo():
        return await _db().users.find_one({"email": email})
    return _mem_users.get(email)


async def create_user(name: str, email: str, password: str, role: str = "user") -> dict:
    email = email.lower().strip()
    doc = {
        "name": name.strip(),
        "email": email,
        "password": hash_password(password),
        "role": role,
        "created_at": datetime.now(timezone.utc),
    }
    if await _use_mongo():
        await _db().users.insert_one(doc)
    else:
        _mem_users[email] = doc
    return doc


async def list_users(limit: int = 100) -> list[dict]:
    if await _use_mongo():
        cursor = _db().users.find({}).sort("created_at", -1).limit(limit)
        return [_public(u) async for u in cursor]
    return [_public(u) for u in list(_mem_users.values())[:limit]]


async def count_users() -> int:
    if await _use_mongo():
        return await _db().users.count_documents({})
    return len(_mem_users)


async def set_role(email: str, role: str) -> bool:
    email = email.lower().strip()
    if await _use_mongo():
        res = await _db().users.update_one({"email": email}, {"$set": {"role": role}})
        return res.modified_count > 0
    if email in _mem_users:
        _mem_users[email]["role"] = role
        return True
    return False


async def delete_user(email: str) -> bool:
    email = email.lower().strip()
    if await _use_mongo():
        res = await _db().users.delete_one({"email": email})
        return res.deleted_count > 0
    return _mem_users.pop(email, None) is not None


async def ensure_admin() -> None:
    """Seed the admin account on startup if it doesn't exist."""
    existing = await get_user(settings.ADMIN_EMAIL)
    if not existing:
        await create_user(
            name="Administrator",
            email=settings.ADMIN_EMAIL,
            password=settings.ADMIN_PASSWORD,
            role="admin",
        )
        logger.info("Seeded admin account: %s", settings.ADMIN_EMAIL)
