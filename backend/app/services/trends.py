"""Health-trends persistence: numeric findings tracked per user over time.

Each analyzed report contributes measurable findings (e.g. Hemoglobin = 10.1).
We store them keyed by user so the frontend can chart how values move across
visits. Falls back to an in-memory store when MongoDB is unavailable.
"""
import logging
import re
from datetime import datetime, timezone

from app.services.db import _db, ping

logger = logging.getLogger("medisum.trends")

_mem: dict[str, list[dict]] = {}

# pull the first number out of a value string like "10.1 g/dL (normal 13.5-17.5)"
_NUM = re.compile(r"-?\d[\d,]*\.?\d*")


def _num(value: str) -> float | None:
    if not value:
        return None
    m = _NUM.search(value.replace(",", ""))
    if not m:
        return None
    try:
        return float(m.group())
    except ValueError:
        return None


async def record(email: str, findings: list[dict]) -> int:
    """Store the numeric findings from one analysis. Returns how many saved."""
    email = (email or "anon").lower()
    now = datetime.now(timezone.utc)
    rows = []
    for f in findings or []:
        val = _num(f.get("value", ""))
        if val is None:
            continue
        rows.append(
            {
                "email": email,
                "item": f.get("item", "Unknown"),
                "value": val,
                "raw": f.get("value", ""),
                "flag": (f.get("flag") or "unclear").lower(),
                "at": now,
            }
        )
    if not rows:
        return 0
    if await ping():
        await _db().trends.insert_many(rows)
    else:
        _mem.setdefault(email, []).extend(rows)
    return len(rows)


async def series(email: str) -> dict:
    """Return trend data grouped by finding name for the given user."""
    email = (email or "anon").lower()
    if await ping():
        cursor = _db().trends.find({"email": email}, {"_id": 0}).sort("at", 1)
        rows = [r async for r in cursor]
    else:
        rows = sorted(_mem.get(email, []), key=lambda r: r["at"])

    grouped: dict[str, list[dict]] = {}
    for r in rows:
        grouped.setdefault(r["item"], []).append(
            {
                "value": r["value"],
                "raw": r.get("raw", ""),
                "flag": r.get("flag", "unclear"),
                "at": r["at"].isoformat() if hasattr(r["at"], "isoformat") else str(r["at"]),
            }
        )
    return {
        "metrics": [
            {"name": name, "points": pts, "latest": pts[-1]["value"], "count": len(pts)}
            for name, pts in grouped.items()
        ]
    }
