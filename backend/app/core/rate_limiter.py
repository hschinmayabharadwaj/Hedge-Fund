"""
Rate Limiting Module
Implements distributed rate limiting using Redis with token bucket algorithm
Protects against brute force and DDoS attacks
"""
from typing import Optional, Callable
from fastapi import Request, HTTPException, status
from redis import asyncio as aioredis
from datetime import datetime, timedelta
import time
import hashlib
import logging
from functools import wraps

from app.core.config import get_settings, get_redis_config


logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Distributed rate limiter using Redis
    Uses atomic Redis pipeline operations to minimize round trips
    """

    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.settings = get_settings()

    async def initialize(self):
        """Initialize Redis connection"""
        if not self.redis:
            redis_config = get_redis_config()
            self.redis = await aioredis.from_url(
                redis_config["url"],
                password=redis_config.get("password"),
                max_connections=redis_config["max_connections"],
                decode_responses=True,
                socket_keepalive=redis_config["socket_keepalive"],
                socket_timeout=redis_config["socket_timeout"],
                retry_on_timeout=redis_config["retry_on_timeout"],
            )

    async def close(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()

    def _get_client_identifier(self, request: Request, identifier: Optional[str] = None) -> str:
        """
        Get unique identifier for rate limiting
        Uses provided identifier, user ID, or IP address
        """
        if identifier:
            return identifier

        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            return f"user:{hashlib.sha256(token.encode()).hexdigest()[:16]}"

        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        return f"ip:{client_ip}"

    async def check_rate_limit(
        self,
        request: Request,
        max_requests: int,
        window_seconds: int,
        identifier: Optional[str] = None,
        cost: int = 1,
    ) -> tuple[bool, dict]:
        """
        Check if request is within rate limit.
        Uses a single Redis pipeline for all operations to minimize round trips.
        """
        if not self.settings.RATE_LIMIT_ENABLED:
            return True, {}

        await self.initialize()

        client_id = self._get_client_identifier(request, identifier)
        key = f"rate_limit:{client_id}:{window_seconds}"

        try:
            # Single pipeline: GET, TTL, INCRBY, EXPIRE — 1 round trip
            pipe = self.redis.pipeline()
            pipe.get(key)
            pipe.ttl(key)
            if cost > 0:
                pipe.incrby(key, cost)
                pipe.expire(key, window_seconds)
            results = await pipe.execute()

            current_count = int(results[0]) if results[0] else 0
            current_ttl = int(results[1]) if results[1] else -2

            if current_count + cost > max_requests:
                ttl = current_ttl if current_ttl > 0 else window_seconds
                return False, {
                    "limit": max_requests,
                    "remaining": max(0, max_requests - current_count),
                    "reset": int(time.time()) + ttl,
                    "retry_after": ttl,
                }

            new_count = current_count + cost
            ttl = current_ttl if current_ttl > 0 else window_seconds
            return True, {
                "limit": max_requests,
                "remaining": max(0, max_requests - new_count),
                "reset": int(time.time()) + ttl,
            }

        except Exception as e:
            logger.error(f"Rate limiter error: {str(e)}")
            return True, {}

    async def check_multiple_limits(
        self,
        request: Request,
        identifier: Optional[str] = None,
        cost: int = 1,
    ) -> tuple[bool, dict]:
        """
        Check against multiple rate limit windows (minute, hour, day) in a single pipeline.
        Returns most restrictive limit hit.
        """
        if not self.settings.RATE_LIMIT_ENABLED:
            return True, {}

        await self.initialize()

        settings = self.settings
        limits = [
            (settings.RATE_LIMIT_PER_MINUTE, 60),
            (settings.RATE_LIMIT_PER_HOUR, 3600),
            (settings.RATE_LIMIT_PER_DAY, 86400),
        ]

        client_id = self._get_client_identifier(request, identifier)

        try:
            # Single pipeline: get counts + TTLs for all windows, then increment all
            pipe = self.redis.pipeline()
            keys = []
            for _, window_seconds in limits:
                key = f"rate_limit:{client_id}:{window_seconds}"
                keys.append(key)
                pipe.get(key)
                pipe.ttl(key)

            results = await pipe.execute()

            # Check limits first
            for i, (max_requests, window_seconds) in enumerate(limits):
                current_count = int(results[i * 2]) if results[i * 2] else 0
                current_ttl = int(results[i * 2 + 1]) if results[i * 2 + 1] else -2

                if current_count + cost > max_requests:
                    ttl = current_ttl if current_ttl > 0 else window_seconds
                    window_names = {60: "minute", 3600: "hour", 86400: "day"}
                    return False, {
                        "limit": max_requests,
                        "remaining": max(0, max_requests - current_count),
                        "reset": int(time.time()) + ttl,
                        "retry_after": ttl,
                        "window": window_names.get(window_seconds, "custom"),
                    }

            # All clear — now increment in one pipeline
            if cost > 0:
                incr_pipe = self.redis.pipeline()
                for key, (_, window_seconds) in zip(keys, limits):
                    incr_pipe.incrby(key, cost)
                    incr_pipe.expire(key, window_seconds)
                await incr_pipe.execute()

            # Return info from minute window
            minute_count = int(results[0]) if results[0] else 0
            minute_ttl = int(results[1]) if results[1] else -2
            ttl = minute_ttl if minute_ttl > 0 else 60
            return True, {
                "limit": settings.RATE_LIMIT_PER_MINUTE,
                "remaining": max(0, settings.RATE_LIMIT_PER_MINUTE - minute_count - cost),
                "reset": int(time.time()) + ttl,
            }

        except Exception as e:
            logger.error(f"Rate limiter error: {str(e)}")
            return True, {}


# Global rate limiter instance
rate_limiter = RateLimiter()


# Rate limiting decorator
def rate_limit(
    max_requests: Optional[int] = None,
    window_seconds: Optional[int] = None,
    cost: int = 1,
    use_multiple: bool = True,
):
    """
    Rate limiting decorator for route handlers
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            if not request:
                for value in kwargs.values():
                    if isinstance(value, Request):
                        request = value
                        break

            if not request:
                raise ValueError("Rate limit decorator requires Request parameter")

            if use_multiple:
                allowed, info = await rate_limiter.check_multiple_limits(request, cost=cost)
            else:
                _max_requests = max_requests or get_settings().RATE_LIMIT_PER_MINUTE
                _window_seconds = window_seconds or 60
                allowed, info = await rate_limiter.check_rate_limit(
                    request, _max_requests, _window_seconds, cost=cost
                )

            if not allowed:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "Rate limit exceeded",
                        "limit": info.get("limit"),
                        "retry_after": info.get("retry_after"),
                        "window": info.get("window", "custom"),
                    },
                    headers={
                        "X-RateLimit-Limit": str(info.get("limit")),
                        "X-RateLimit-Remaining": str(info.get("remaining", 0)),
                        "X-RateLimit-Reset": str(info.get("reset")),
                        "Retry-After": str(info.get("retry_after")),
                    },
                )

            response = await func(*args, **kwargs)

            if hasattr(response, "headers"):
                response.headers["X-RateLimit-Limit"] = str(info.get("limit", ""))
                response.headers["X-RateLimit-Remaining"] = str(info.get("remaining", ""))
                response.headers["X-RateLimit-Reset"] = str(info.get("reset", ""))

            return response

        return wrapper
    return decorator


# Login attempt limiter (more restrictive)
class LoginRateLimiter:
    """Specialized rate limiter for login attempts"""

    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.settings = get_settings()

    async def initialize(self):
        """Initialize Redis connection"""
        if not self.redis:
            redis_config = get_redis_config()
            self.redis = await aioredis.from_url(redis_config["url"], decode_responses=True)

    async def check_login_attempts(self, username: str) -> tuple[bool, int]:
        """
        Check if username has exceeded login attempts.
        Returns (is_allowed, remaining_lockout_seconds).
        """
        await self.initialize()

        key = f"login_attempts:{username}"
        lockout_key = f"login_lockout:{username}"

        # Single pipeline: check lockout + get attempts
        pipe = self.redis.pipeline()
        pipe.exists(lockout_key)
        pipe.ttl(lockout_key)
        pipe.get(key)
        results = await pipe.execute()

        is_locked = results[0]
        lockout_ttl = int(results[1]) if results[1] else -2
        attempts = int(results[2]) if results[2] else 0

        if is_locked:
            return False, lockout_ttl if lockout_ttl > 0 else 0

        if attempts >= self.settings.MAX_LOGIN_ATTEMPTS:
            lockout_duration = self.settings.LOCKOUT_DURATION_MINUTES * 60
            pipe2 = self.redis.pipeline()
            pipe2.setex(lockout_key, lockout_duration, "1")
            pipe2.delete(key)
            await pipe2.execute()
            return False, lockout_duration

        return True, 0

    async def record_failed_attempt(self, username: str):
        """Record a failed login attempt"""
        await self.initialize()

        key = f"login_attempts:{username}"
        pipe = self.redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, self.settings.LOCKOUT_DURATION_MINUTES * 60)
        await pipe.execute()

    async def reset_attempts(self, username: str):
        """Reset login attempts after successful login"""
        await self.initialize()

        key = f"login_attempts:{username}"
        await self.redis.delete(key)


# Global login rate limiter
login_rate_limiter = LoginRateLimiter()
