import logging
from typing import List, Dict, Any
from datetime import datetime, timezone
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession

from services.fusion.pipeline import FusionPipeline, FusionResult
from services.fusion.exposure import ExposureEngine
from services.alerts.engine import AlertEngine, Alert

logger = logging.getLogger(__name__)

@dataclass
class ReplayStep:
    timestamp: datetime
    fusion_result: FusionResult
    exposure_result: Dict[str, Any]
    alert: Alert | None

class EventReplayEngine:
    """
    Engine to orchestrate a causally-strict historical replay of a disaster event.
    Uses the exact same production components as the live pipeline, but injects
    a historical `time_context` to prevent hindsight leakage.
    """
    def __init__(self, db_session: AsyncSession = None):
        self.db = db_session

    async def execute_replay(self, lat: float, lon: float, timesteps: List[datetime]) -> List[ReplayStep]:
        """
        Execute a replay across the given timesteps.
        """
        pipeline = FusionPipeline(self.db)
        exposure_engine = ExposureEngine()
        alert_engine = AlertEngine(db_session=self.db)
        
        # Exposure is generally static over a 1-year horizon, so we fetch it once for the replay
        # to save Overpass API rate limits during the loop.
        logger.info(f"Fetching exposure context for {lat}, {lon}")
        exposure_result = await exposure_engine.get_exposure_metrics(lat, lon)
        
        timeline = []
        
        for t in timesteps:
            logger.info(f"--- Replaying timestep: {t.isoformat()} ---")
            
            # 1. Run Fusion with Time Context
            fusion_result = await pipeline.run(lat, lon, time_context=t)
            
            # 2. Evaluate Alerts
            alert = await alert_engine.evaluate(fusion_result, exposure_result)
            
            # 3. Record Step
            timeline.append(ReplayStep(
                timestamp=t,
                fusion_result=fusion_result,
                exposure_result=exposure_result,
                alert=alert
            ))
            
        return timeline
