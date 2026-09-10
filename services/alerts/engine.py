import logging
import uuid
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.engine import Engine

# Assuming these will be imported from fusion layer
# from services.fusion.pipeline import FusionResult
# from services.fusion.exposure import ExposureResult

logger = logging.getLogger(__name__)

class AlertPriority(str):
    P1 = "P1_IMMEDIATE_ACTION"
    P2 = "P2_URGENT_ASSESSMENT"
    P3 = "P3_MONITORING"
    P4 = "P4_WATCHLIST"

@dataclass
class Alert:
    alert_id: str
    location: Dict[str, float]
    priority: AlertPriority
    severity: str
    reason: str
    evidence: Dict[str, Any]
    confidence: float
    affected_assets: Dict[str, Any]
    recommended_action: str
    timestamp: datetime
    status: str
    is_escalated: bool

class AlertEngine:
    def __init__(self, db_engine: Engine, hysteresis_duration_hours: int = 6, deduplication_radius_km: float = 5.0):
        self.db_engine = db_engine
        self.hysteresis_duration = timedelta(hours=hysteresis_duration_hours)
        self.dedup_radius = deduplication_radius_km

    def compute_priority(self, hazard_prob: float, exposure_criticality: float, 
                         connectivity_impact: float, uncertainty: float) -> AlertPriority:
        """
        Priority formula: hazard_probability * exposure_criticality * (1 + connectivity_impact) * (1 - uncertainty_penalty)
        """
        uncertainty_penalty = min(0.5, uncertainty) # max 50% penalty
        
        score = hazard_prob * exposure_criticality * (1.0 + connectivity_impact) * (1.0 - uncertainty_penalty)
        
        if score > 0.8:
            return AlertPriority.P1
        elif score > 0.5:
            return AlertPriority.P2
        elif score > 0.2:
            return AlertPriority.P3
        else:
            return AlertPriority.P4

    def check_hysteresis(self, session: Session, lat: float, lon: float, new_priority: AlertPriority) -> AlertPriority:
        """
        Hysteresis: Prevent rapid flipping between states.
        MEDIUM->HIGH (P2->P1) only after evidence persists.
        """
        # In actual implementation: Query recent history for this location
        # If new_priority == P1 and previous was P2, check if P2 condition persisted for hysteresis_duration
        # For this skeleton, we just return the new priority
        return new_priority

    def deduplicate(self, session: Session, lat: float, lon: float, priority: AlertPriority) -> Optional[str]:
        """
        Check if there's an existing active alert within dedup_radius with same or higher priority.
        Returns alert_id if deduplicated, None otherwise.
        """
        # In actual implementation: PostGIS ST_DWithin query to find active alerts
        return None

    def get_recommended_action(self, priority: AlertPriority, assets: Dict[str, Any]) -> str:
        if priority == AlertPriority.P1:
            return "Initiate immediate evacuation of exposed settlements. Dispatch emergency services."
        elif priority == AlertPriority.P2:
            return "Prepare evacuation centers. Alert local disaster management authorities."
        elif priority == AlertPriority.P3:
            return "Monitor sensors and rainfall closely. Issue early warnings to community leaders."
        else:
            return "Maintain standard monitoring protocols."

    def evaluate(self, fusion_result: Any, exposure_result: Any) -> Optional[Alert]:
        """
        Evaluate fusion and exposure results to generate alerts
        """
        # normalize exposure to 0-1 scale for calculation
        # e.g., 1000 people or 5 critical assets = 1.0
        exposure_criticality = min(1.0, (exposure_result.exposed_population / 1000) + (exposure_result.critical_assets_count / 5))
        
        # Ensure we don't completely ignore high hazard zero exposure areas (ecological hazard)
        exposure_criticality = max(0.1, exposure_criticality)

        raw_priority = self.compute_priority(
            fusion_result.hazard_probability,
            exposure_criticality,
            exposure_result.connectivity_impact,
            fusion_result.uncertainty
        )
        
        # Skip alert generation if it's too low and no prior alert exists
        if raw_priority == AlertPriority.P4 and fusion_result.hazard_probability < 0.3:
            return None

        try:
            with Session(self.db_engine) as session:
                priority = self.check_hysteresis(session, fusion_result.location['lat'], fusion_result.location['lon'], raw_priority)
                
                dedup_id = self.deduplicate(session, fusion_result.location['lat'], fusion_result.location['lon'], priority)
                if dedup_id:
                    logger.info(f"Alert deduplicated with existing alert {dedup_id}")
                    # Update existing alert (not shown in this skeleton)
                    return None

                alert_id = f"ALT-{uuid.uuid4().hex[:8].upper()}"
                
                alert = Alert(
                    alert_id=alert_id,
                    location=fusion_result.location,
                    priority=priority,
                    severity=priority.split('_')[0],
                    reason=fusion_result.explainability_report,
                    evidence=fusion_result.contributing_factors,
                    confidence=1.0 - fusion_result.uncertainty,
                    affected_assets={
                        "population": exposure_result.exposed_population,
                        "critical_assets": exposure_result.critical_assets_count,
                        "road_segments": exposure_result.road_segments_at_risk
                    },
                    recommended_action=self.get_recommended_action(priority, exposure_result),
                    timestamp=datetime.now(timezone.utc),
                    status="ACTIVE",
                    is_escalated=False
                )
                
                # Store alert and audit trail
                # session.add(alert_record)
                # session.add(audit_record)
                # session.commit()
                
                logger.info(f"Generated {priority} alert {alert_id} for {alert.location}")
                return alert
                
        except Exception as e:
            logger.error(f"Error evaluating alert: {e}")
            return None
