"""Lightweight in-memory sliding-window rate limiter (per client IP).

For a single-instance deployment this is sufficient. For multi-instance,
swap the backing store for Redis (documented in the roadmap).
"""
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self, per_minute: int):
        self.per_minute = per_minute
        self.window = 60.0
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str) -> None:
        now = time.time()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > self.window:
                q.popleft()
            if len(q) >= self.per_minute:
                retry = int(self.window - (now - q[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Retry in {retry}s.",
                    headers={"Retry-After": str(retry)},
                )
            q.append(now)


def client_key(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
