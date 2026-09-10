from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
import redis.asyncio as aioredis
import logging

from services.api.database import get_db, check_db_health
from services.api.schemas.common import HealthCheck, DependencyHealth
from services.api.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


async def _check_redis() -> tuple[bool, float, str | None]:
    """Actually test Redis connectivity. Never report healthy if Redis is down."""
    start = datetime.now()
    try:
        client = aioredis.from_url(settings.REDIS_URL, socket_timeout=3.0)
        pong = await client.ping()
        latency = (datetime.now() - start).total_seconds() * 1000
        await client.aclose()
        return pong, latency, None
    except Exception as exc:
        latency = (datetime.now() - start).total_seconds() * 1000
        logger.error("Redis health check failed", exc_info=True)
        return False, latency, str(exc)


async def _check_minio() -> tuple[bool, float, str | None]:
    """Actually test MinIO/S3 connectivity. Never report healthy if storage is down."""
    start = datetime.now()
    try:
        from minio import Minio
        client = Minio(
            settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=False,
        )
        # List buckets is a lightweight connectivity test
        client.list_buckets()
        latency = (datetime.now() - start).total_seconds() * 1000
        return True, latency, None
    except Exception as exc:
        latency = (datetime.now() - start).total_seconds() * 1000
        logger.error("MinIO health check failed", exc_info=True)
        return False, latency, str(exc)


@router.get("/liveness")
async def liveness():
    """Basic liveness probe. Returns OK if the process is alive."""
    return {"status": "ok"}


@router.get("/readiness")
async def readiness(response: Response, db: AsyncSession = Depends(get_db)):
    """Readiness probe. Checks that critical dependencies are available."""
    db_ok = await check_db_health()
    redis_ok, _, _ = await _check_redis()

    if not db_ok or not redis_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "error",
            "database": "up" if db_ok else "down",
            "redis": "up" if redis_ok else "down",
        }

    return {"status": "ok"}


@router.get("/health", response_model=HealthCheck)
async def health(response: Response, db: AsyncSession = Depends(get_db)):
    """
    Detailed health check. Tests EVERY dependency and reports actual status.
    Per spec §90: Never return healthy if dependencies are down.
    """
    deps = {}
    is_healthy = True

    # Database check
    db_start = datetime.now()
    db_ok = await check_db_health()
    db_latency = (datetime.now() - db_start).total_seconds() * 1000
    deps["database"] = DependencyHealth(
        status="up" if db_ok else "down",
        latency_ms=db_latency,
        error=None if db_ok else "Database connection failed",
    )
    if not db_ok:
        is_healthy = False

    # Redis check — actually ping Redis
    redis_ok, redis_latency, redis_error = await _check_redis()
    deps["redis"] = DependencyHealth(
        status="up" if redis_ok else "down",
        latency_ms=redis_latency,
        error=redis_error,
    )
    if not redis_ok:
        is_healthy = False

    # MinIO check — actually list buckets
    minio_ok, minio_latency, minio_error = await _check_minio()
    deps["object_storage"] = DependencyHealth(
        status="up" if minio_ok else "down",
        latency_ms=minio_latency,
        error=minio_error,
    )
    if not minio_ok:
        is_healthy = False

    if not is_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return HealthCheck(
        status="healthy" if is_healthy else "unhealthy",
        version=settings.VERSION,
        timestamp=datetime.now(),
        dependencies=deps,
    )
