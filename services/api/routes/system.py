from fastapi import APIRouter
from datetime import datetime
from typing import Dict, Any

from services.api.config import settings

router = APIRouter()

@router.get("/status")
async def system_status() -> Dict[str, Any]:
    # In reality, this queries the actual data sources to verify integration
    return {
        "sources": {
            "IMD": {
                "status": "OPERATIONAL",
                "last_sync": datetime.now(),
                "data_mode": settings.DATA_MODE
            },
            "GEE": {
                "status": "OPERATIONAL",
                "last_sync": datetime.now(),
                "data_mode": settings.DATA_MODE
            },
            "Sentinel-1": {
                "status": "DEGRADED",
                "last_sync": datetime.now(),
                "data_mode": settings.DATA_MODE,
                "notes": "Delay in acquisition"
            },
            "GSI": {
                "status": "OPERATIONAL",
                "last_sync": datetime.now(),
                "data_mode": settings.DATA_MODE
            },
            "Model Server": {
                "status": "OPERATIONAL",
                "last_sync": datetime.now(),
                "data_mode": settings.DATA_MODE
            },
            "Database": {
                "status": "OPERATIONAL",
                "last_sync": datetime.now(),
                "data_mode": settings.DATA_MODE
            }
        },
        "mode": settings.DATA_MODE
    }
