"""Authentication primitives: password hashing and JWT tokens.

Uses PBKDF2-HMAC-SHA256 from the standard library for password hashing (no
native build deps) and HMAC-signed JWTs via python-jose.
"""
import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()

_ALGO = "HS256"
_PBKDF2_ROUNDS = 200_000


def hash_password(password: str) -> str:
    """Return a salted PBKDF2 hash encoded as 'salt$hash' (hex)."""
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ROUNDS)
    return f"{salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, hash_hex = stored.split("$", 1)
    except ValueError:
        return False
    salt = bytes.fromhex(salt_hex)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ROUNDS)
    return hmac.compare_digest(dk.hex(), hash_hex)


def create_access_token(sub: str, role: str, expires_minutes: int | None = None) -> str:
    exp = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_MINUTES
    )
    payload = {"sub": sub, "role": role, "exp": exp}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=_ALGO)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[_ALGO])
    except JWTError:
        return None
