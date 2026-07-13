"""
Main FastAPI Application
Secure, scalable backend with comprehensive security features
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging
import time
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from app.core.config import get_settings
from app.core.database import init_db, close_db
from app.core.security import add_security_headers
from app.core.rate_limiter import rate_limiter
from app.core.kafka_client import kafka_producer, kafka_admin
from app.api.auth import router as auth_router
from app.api.routes import router as api_router
from app.api.market import router as market_router


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)
REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)
SECURITY_EVENTS = Counter(
    'security_events_total',
    'Total security events',
    ['event_type']
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    settings = get_settings()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Initialize database
    try:
        await init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")

    # Initialize Kafka (wrapped in executor to avoid blocking the event loop)
    try:
        import asyncio
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, kafka_producer.initialize)
        await loop.run_in_executor(None, kafka_admin.initialize)

        # Create default topics
        await loop.run_in_executor(
            None,
            kafka_admin.create_topics,
            ["users", "messages", "events", "audit"],
        )
        logger.info("Kafka initialized")
    except Exception as e:
        logger.error(f"Failed to initialize Kafka: {str(e)}")

    # Initialize rate limiter
    try:
        await rate_limiter.initialize()
        logger.info("Rate limiter initialized")
    except Exception as e:
        logger.error(f"Failed to initialize rate limiter: {str(e)}")

    yield

    # Cleanup
    logger.info("Shutting down...")

    try:
        kafka_producer.close()
        logger.info("Kafka producer closed")
    except Exception as e:
        logger.error(f"Error closing Kafka producer: {str(e)}")

    try:
        await rate_limiter.close()
        logger.info("Rate limiter closed")
    except Exception as e:
        logger.error(f"Error closing rate limiter: {str(e)}")

    try:
        await close_db()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database: {str(e)}")


# Create FastAPI app
settings = get_settings()

app = FastAPI(
    title="Secure Backend API",
    description="Secure and scalable FastAPI backend with Kafka, Redis, and comprehensive security",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)


# GZip Compression — reduces response payload size and network latency
app.add_middleware(GZipMiddleware, minimum_size=500)


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)


# Trusted Host Middleware (prevent host header attacks)
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["yourdomain.com", "*.yourdomain.com"],
    )


# Unified middleware: timing + security headers + metrics + security event tracking
@app.middleware("http")
async def process_middleware(request: Request, call_next):
    """
    Single middleware that handles:
    - Request timing
    - Security headers
    - Prometheus metrics
    - Security event tracking
    """
    start_time = time.time()

    try:
        response = await call_next(request)

        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)

        # Add security headers
        response = add_security_headers(response)

        # Collect metrics
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code,
        ).inc()

        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path,
        ).observe(process_time)

        # Security event tracking (merged from separate middleware)
        if response.status_code == 401:
            SECURITY_EVENTS.labels(event_type="auth_failure").inc()
        elif response.status_code == 403:
            SECURITY_EVENTS.labels(event_type="permission_denied").inc()
        elif response.status_code == 429:
            SECURITY_EVENTS.labels(event_type="rate_limit_exceeded").inc()

        return response

    except Exception as e:
        logger.error(f"Request processing error: {str(e)}")
        SECURITY_EVENTS.labels(event_type="internal_error").inc()

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)

    SECURITY_EVENTS.labels(event_type="unhandled_exception").inc()

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# Include routers
app.include_router(auth_router)
app.include_router(api_router)
app.include_router(market_router)


# Prometheus metrics endpoint
@app.get("/metrics")
async def metrics():
    """Expose Prometheus metrics"""
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Secure Backend API",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.ENVIRONMENT != "production" else "disabled",
    }


# Health check
@app.get("/health")
async def health():
    """Health check endpoint with pool status"""
    from app.core.database import get_engine

    pool_info = {}
    try:
        engine = get_engine()
        pool = engine.pool
        pool_info = {
            "pool_size": pool.size(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "idle": pool.checkedin(),
        }
    except Exception:
        pool_info = {"error": "pool unavailable"}

    return {
        "status": "healthy",
        "timestamp": time.time(),
        "database_pool": pool_info,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else 4,
        log_level=settings.LOG_LEVEL.lower(),
    )
