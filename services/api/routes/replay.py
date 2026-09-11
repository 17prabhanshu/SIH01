from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from datetime import datetime, timezone
import logging

from services.api.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from services.fusion.replay import EventReplayEngine

logger = logging.getLogger(__name__)
router = APIRouter()

# Pre-configured authoritative historical events for the demo
HISTORICAL_EVENTS = {
    "sikkim-oct-2023": {
        "id": "sikkim-oct-2023",
        "name": "Sikkim Flash Flood & Landslides",
        "location": {"lat": 27.3314, "lon": 88.6138, "name": "Gangtok AOI (Teesta Basin)"},
        "description": "South Lhonak Lake GLOF triggering massive cascading hazards.",
        "start_date": "2023-10-01T12:00:00Z",
        "end_date": "2023-10-08T12:00:00Z",
        "timesteps": [
            "2023-10-01T12:00:00Z",
            "2023-10-02T12:00:00Z",
            "2023-10-03T12:00:00Z",
            "2023-10-04T12:00:00Z",
            "2023-10-07T13:00:00Z",
            "2023-10-08T12:00:00Z"
        ]
    }
}

@router.get("/events")
async def list_historical_events():
    """List available pre-validated historical replay events."""
    return {"status": "SUCCESS", "events": list(HISTORICAL_EVENTS.values())}

@router.post("/execute/{event_id}")
async def execute_replay(event_id: str, db: AsyncSession = Depends(get_db)):
    """
    Execute a causally-strict replay of the selected historical event.
    WARNING: This executes massive GEE and Open-Meteo fetches in sequence.
    Expect high latency on first run before caching.
    """
    if event_id not in HISTORICAL_EVENTS:
        raise HTTPException(status_code=404, detail="Event not found or data-gated.")
        
    event = HISTORICAL_EVENTS[event_id]
    
    timesteps = []
    for ts_str in event["timesteps"]:
        timesteps.append(datetime.fromisoformat(ts_str.replace('Z', '+00:00')))
        
    engine = EventReplayEngine(db_session=db)
    
    try:
        steps = await engine.execute_replay(
            lat=event["location"]["lat"],
            lon=event["location"]["lon"],
            timesteps=timesteps
        )
        
        # Serialize the output
        timeline = []
        for s in steps:
            timeline.append({
                "timestamp": s.timestamp.isoformat(),
                "fusion_result": {
                    "hazard_evidence_score": s.fusion_result.hazard_evidence_score,
                    "evidence_coverage": s.fusion_result.evidence_coverage,
                    "assessment_status": s.fusion_result.assessment_status,
                    "assessment_confidence": s.fusion_result.assessment_confidence,
                    "data_freshness": s.fusion_result.data_freshness,
                    "contributing_factors": s.fusion_result.contributing_factors,
                    "explainability_report": s.fusion_result.explainability_report
                },
                "exposure_result": {
                    "exposure_criticality": s.exposure_result.get("exposure_criticality", 0.0),
                    "hospitals_exposed": s.exposure_result.get("hospitals_exposed", 0),
                    "schools_exposed": s.exposure_result.get("schools_exposed", 0),
                    "buildings_exposed": s.exposure_result.get("buildings_exposed", 0)
                },
                "alert": s.alert.dict() if s.alert else None
            })
            
        return {
            "status": "SUCCESS",
            "event": event["name"],
            "timeline": timeline
        }
    except Exception as e:
        logger.error(f"Replay execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
