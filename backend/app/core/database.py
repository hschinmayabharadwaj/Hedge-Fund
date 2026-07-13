"""
Database Connection and Session Management
Dynamic pool scaling, health monitoring, and auto-recovery.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import QueuePool
from typing import AsyncGenerator, Optional
import asyncio
import logging
import time
from prometheus_client import Gauge, Counter

from app.core.config import get_settings


logger = logging.getLogger(__name__)


# Prometheus pool metrics
POOL_SIZE = Gauge('db_pool_size', 'Current connection pool size')
POOL_CHECKED_OUT = Gauge('db_pool_checked_out', 'Connections currently checked out')
POOL_CHECKED_IN = Gauge('db_pool_checked_in', 'Connections currently idle in pool')
POOL_OVERFLOW = Gauge('db_pool_overflow', 'Current overflow connections')
POOL_WAITERS = Gauge('db_pool_waiters', 'Number of threads waiting for a connection')
POOL_TIMEOUTS = Counter('db_pool_timeouts_total', 'Total connection checkout timeouts')
POOL_EXHAUSTION_EVENTS = Counter('db_pool_exhaustion_total', 'Total pool exhaustion events')


# Lazy engine initialization
_engine = None
_SessionFactory = None
_pool_monitor_task: Optional[asyncio.Task] = None


def _normalize_database_url(url: str) -> str:
    """Ensure the URL uses the async driver."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url


def get_engine():
    """Create and configure database engine with dynamic pool settings (singleton)."""
    global _engine
    if _engine is not None:
        return _engine

    settings = get_settings()
    db_url = _normalize_database_url(settings.DATABASE_URL)

    _engine = create_async_engine(
        db_url,
        poolclass=QueuePool,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=settings.DATABASE_POOL_RECYCLE,
        pool_timeout=settings.DATABASE_POOL_TIMEOUT,
        pool_reset_on_return="commit",
        echo=settings.DEBUG,
    )

    logger.info(
        f"Database engine created: pool_size={settings.DATABASE_POOL_SIZE}, "
        f"max_overflow={settings.DATABASE_MAX_OVERFLOW}"
    )
    return _engine


def get_session_factory():
    """Get or create session factory (singleton)."""
    global _SessionFactory
    if _SessionFactory is not None:
        return _SessionFactory

    engine = get_engine()
    _SessionFactory = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    return _SessionFactory


# --------------- Dynamic Pool Scaling ---------------

async def _get_pool():
    """Return the underlying sync pool from the async engine."""
    engine = get_engine()
    return engine.pool


async def _monitor_pool():
    """
    Background coroutine that monitors pool health every 5 seconds.
    - Emits Prometheus gauges for pool state.
    - Dynamically adjusts max_overflow when saturation is sustained.
    - Logs warnings when pool is under pressure.
    """
    settings = get_settings()
    engine = get_engine()
    pool = engine.pool

    saturation_streak = 0
    SCALE_UP_THRESHOLD = 0.85    # 85% checked-out triggers scale-up
    SCALE_DOWN_THRESHOLD = 0.30  # Below 30% triggers scale-down
    SCALE_COOLDOWN = 60          # Seconds between scale events
    last_scale_time = 0.0

    while True:
        try:
            await asyncio.sleep(5)

            # Grab pool stats from the sync pool (safe to call from async)
            pool_size = pool.size()
            checked_out = pool.checkedout()
            checked_in = pool.checkedin()
            overflow = pool.overflow()
            total_capacity = pool_size + pool._max_overflow

            # Update Prometheus
            POOL_SIZE.set(pool_size)
            POOL_CHECKED_OUT.set(checked_out)
            POOL_CHECKED_IN.set(checked_in)
            POOL_OVERFLOW.set(overflow)

            utilization = checked_out / total_capacity if total_capacity > 0 else 0

            # Scale-up logic
            now = time.monotonic()
            if utilization >= SCALE_UP_THRESHOLD:
                saturation_streak += 1
                if saturation_streak >= 3 and (now - last_scale_time) > SCALE_COOLDOWN:
                    new_overflow = min(pool._max_overflow + 5, settings.DATABASE_MAX_OVERFLOW + 50)
                    if new_overflow > pool._max_overflow:
                        pool._max_overflow = new_overflow
                        last_scale_time = now
                        POOL_EXHAUSTION_EVENTS.inc()
                        logger.warning(
                            f"Pool saturation detected ({utilization:.0%}). "
                            f"Scaled max_overflow: {pool._max_overflow}"
                        )
            else:
                saturation_streak = 0

            # Scale-down logic (idle pool)
            if utilization < SCALE_DOWN_THRESHOLD and pool._max_overflow > settings.DATABASE_MAX_OVERFLOW:
                if (now - last_scale_time) > SCALE_COOLDOWN:
                    new_overflow = max(pool._max_overflow - 5, settings.DATABASE_MAX_OVERFLOW)
                    if new_overflow != pool._max_overflow:
                        pool._max_overflow = new_overflow
                        last_scale_time = now
                        logger.info(
                            f"Pool utilization low ({utilization:.0%}). "
                            f"Scaled max_overflow down: {pool._max_overflow}"
                        )

            # Log saturation warnings
            if utilization >= 0.70:
                logger.warning(
                    f"DB pool utilization: {utilization:.0%} "
                    f"({checked_out}/{total_capacity})"
                )

        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Pool monitor error: {e}")
            await asyncio.sleep(10)


def start_pool_monitor():
    """Start the background pool monitor task."""
    global _pool_monitor_task
    if _pool_monitor_task is None or _pool_monitor_task.done():
        try:
            loop = asyncio.get_running_loop()
            _pool_monitor_task = loop.create_task(_monitor_pool())
            logger.info("Pool health monitor started")
        except RuntimeError:
            pass


def stop_pool_monitor():
    """Stop the background pool monitor task."""
    global _pool_monitor_task
    if _pool_monitor_task is not None and not _pool_monitor_task.done():
        _pool_monitor_task.cancel()
        _pool_monitor_task = None


# --------------- Session Dependency ---------------

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database session.
    Does NOT auto-commit — each route is responsible for its own commit/rollback.
    """
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# --------------- Lifecycle ---------------

async def init_db():
    """Initialize database (create tables + start pool monitor)."""
    from app.models.database import Base

    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    start_pool_monitor()
    logger.info("Database initialized successfully")


async def close_db():
    """Close database connection + stop pool monitor."""
    stop_pool_monitor()
    global _engine, _SessionFactory
    if _engine is not None:
        await _engine.dispose()
        _engine = None
    _SessionFactory = None
    logger.info("Database connection closed")
