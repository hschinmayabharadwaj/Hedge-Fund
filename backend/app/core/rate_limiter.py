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
from functools import wraps

from app.core.config import get_settings, get_redis_config


class RateLimiter:
    """
    Distributed rate limiter using Redis
    Implements token bucket algorithm for smooth rate limiting
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
                retry_on_timeout=redis_config["retry_on_timeout"]
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
        
        # Try to get user from token
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            # Use token hash as identifier
            return f"user:{hashlib.sha256(token.encode()).hexdigest()[:16]}"
        
        # Fall back to IP address
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
        cost: int = 1
    ) -> tuple[bool, dict]:
        """
        Check if request is within rate limit
        
        Args:
            request: FastAPI request object
            max_requests: Maximum requests allowed in window
            window_seconds: Time window in seconds
            identifier: Optional custom identifier
            cost: Request cost (default 1, can be higher for expensive operations)
        
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        if not self.settings.RATE_LIMIT_ENABLED:
            return True, {}
        
        await self.initialize()
        
        client_id = self._get_client_identifier(request, identifier)
        key = f"rate_limit:{client_id}:{window_seconds}"
        
        try:
            # Use Redis pipeline for atomic operations
            pipe = self.redis.pipeline()
            
            # Get current count
            current_count = await self.redis.get(key)
            current_count = int(current_count) if current_count else 0
            
            # Check if limit exceeded
            if current_count + cost > max_requests:
                ttl = await self.redis.ttl(key)
                return False, {
                    "limit": max_requests,
                    "remaining": max(0, max_requests - current_count),
                    "reset": int(time.time()) + ttl if ttl > 0 else int(time.time()) + window_seconds,
                    "retry_after": ttl if ttl > 0 else window_seconds
                }
            
            # Increment counter
            pipe.incrby(key, cost)
            pipe.expire(key, window_seconds)
            await pipe.execute()
            
            # Get updated values
            new_count = current_count + cost
            ttl = await self.redis.ttl(key)
            
            return True, {
                "limit": max_requests,
                "remaining": max(0, max_requests - new_count),
                "reset": int(time.time()) + ttl if ttl > 0 else int(time.time()) + window_seconds
            }
            
        except Exception as e:
            # If Redis fails, allow request but log error
            print(f"Rate limiter error: {str(e)}")
            return True, {}
    
    async def check_multiple_limits(
        self,
        request: Request,
        identifier: Optional[str] = None,
        cost: int = 1
    ) -> tuple[bool, dict]:
        """
        Check against multiple rate limit windows (minute, hour, day)
        Returns most restrictive limit
        """
        settings = self.settings
        
        limits = [
            (settings.RATE_LIMIT_PER_MINUTE, 60, "minute"),
            (settings.RATE_LIMIT_PER_HOUR, 3600, "hour"),
            (settings.RATE_LIMIT_PER_DAY, 86400, "day")
        ]
        
        for max_requests, window_seconds, window_name in limits:
            allowed, info = await self.check_rate_limit(
                request, max_requests, window_seconds, identifier, cost
            )
            
            if not allowed:
                info["window"] = window_name
                return False, info
        
        # Return info from minute window (shortest)
        allowed, info = await self.check_rate_limit(
            request, settings.RATE_LIMIT_PER_MINUTE, 60, identifier, 0  # cost=0 to not increment
        )
        return True, info


# Global rate limiter instance
rate_limiter = RateLimiter()


# Rate limiting decorator
def rate_limit(
    max_requests: Optional[int] = None,
    window_seconds: Optional[int] = None,
    cost: int = 1,
    use_multiple: bool = True
):
    """
    Rate limiting decorator for route handlers
    
    Args:
        max_requests: Max requests in window (uses config default if None)
        window_seconds: Window in seconds (uses 60 if None and use_multiple is False)
        cost: Request cost multiplier
        use_multiple: Use multiple time windows (minute, hour, day)
    
    Usage:
        @router.get("/expensive-endpoint")
        @rate_limit(cost=5)  # This endpoint costs 5 tokens
        async def expensive_operation():
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request from function arguments
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
            
            # Check rate limit
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
                        "window": info.get("window", "custom")
                    },
                    headers={
                        "X-RateLimit-Limit": str(info.get("limit")),
                        "X-RateLimit-Remaining": str(info.get("remaining", 0)),
                        "X-RateLimit-Reset": str(info.get("reset")),
                        "Retry-After": str(info.get("retry_after"))
                    }
                )
            
            # Add rate limit headers to response
            response = await func(*args, **kwargs)
            
            # If response is a Response object, add headers
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
        Check if username has exceeded login attempts
        Returns (is_allowed, remaining_lockout_seconds)
        """
        await self.initialize()
        
        key = f"login_attempts:{username}"
        lockout_key = f"login_lockout:{username}"
        
        # Check if account is locked
        if await self.redis.exists(lockout_key):
            ttl = await self.redis.ttl(lockout_key)
            return False, ttl
        
        # Get attempt count
        attempts = await self.redis.get(key)
        attempts = int(attempts) if attempts else 0
        
        if attempts >= self.settings.MAX_LOGIN_ATTEMPTS:
            # Lock the account
            lockout_duration = self.settings.LOCKOUT_DURATION_MINUTES * 60
            await self.redis.setex(lockout_key, lockout_duration, "1")
            await self.redis.delete(key)
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
