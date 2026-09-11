from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from services.api.dependencies import get_db
from services.fusion.exposure import ExposureEngine
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/exposure", tags=["exposure"])

@router.get("/location", response_model=Dict[str, Any])
async def get_location_exposure(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: float = Query(1000.0, description="Search radius in meters")
):
    """
    Get exposure metrics (buildings, hospitals, schools, roads) for a given location.
    Queries the OpenStreetMap Overpass API.
    """
    engine = ExposureEngine()
    try:
        metrics = await engine.get_exposure_metrics(lat, lon, radius)
        return metrics
    except Exception as e:
        logger.error(f"Failed to calculate exposure: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate exposure metrics")
