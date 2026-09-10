"""API Routes"""
from fastapi import APIRouter
from .health import router as health_router
from .risk import router as risk_router
from .alerts import router as alerts_router
from .reports import router as reports_router
from .system import router as system_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="", tags=["health"])
api_router.include_router(risk_router, prefix="/api/v1/risk", tags=["risk"])
api_router.include_router(alerts_router, prefix="/api/v1/alerts", tags=["alerts"])
api_router.include_router(reports_router, prefix="/api/v1/reports", tags=["reports"])
api_router.include_router(system_router, prefix="/api/v1/system", tags=["system"])
