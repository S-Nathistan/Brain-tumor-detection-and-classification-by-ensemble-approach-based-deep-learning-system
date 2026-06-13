"""In-memory sliding-window rate limiter for auth-sensitive endpoints.

Per-process only — sufficient for the single-worker deployment this project
uses. If the API is ever scaled to multiple workers/hosts, replace with a
shared store (e.g. Redis) behind the same interface.
"""

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self, max_attempts: int, window_seconds: int):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str) -> None:
        """Record one attempt for `key`; raise 429 if the window is exhausted."""
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            cutoff = now - self.window_seconds
            while hits and hits[0] < cutoff:
                hits.popleft()
            if len(hits) >= self.max_attempts:
                retry_after = max(1, int(hits[0] + self.window_seconds - now) + 1)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many attempts. Please try again later.",
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)


# Staff login: password-based, allow a few typos.
staff_login_limiter = RateLimiter(max_attempts=10, window_seconds=300)

# Mobile login: hospital-ID based (no password), so enumeration is the threat —
# keep this window tight.
mobile_login_limiter = RateLimiter(max_attempts=5, window_seconds=300)


def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"
