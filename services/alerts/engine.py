import logging
import uuid
import json
from typing import Dict, Any, Optional, List
from dataclasses import dataclass, asdict
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from services.api.routes.websocket import manager as ws_manager

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

    def dict(self):
        return {
            "alert_id": self.alert_id,
            "location": self.location,
            "priority": self.priority,
            "severity": self.severity,
            "reason": self.reason,
            "evidence": self.evidence,
            "confidence": self.confidence,
            "affected_assets": self.affected_assets,
            "recommended_action": self.recommended_action,
            "timestamp": self.timestamp.isoformat(),
            "status": self.status,
            "is_escalated": self.is_escalated
        }

class AlertEngine:
    def __init__(self, db_session: AsyncSession = None, hysteresis_duration_hours: int = 6, deduplication_radius_km: float = 5.0):
        self.db = db_session
        self.hysteresis_duration = timedelta(hours=hysteresis_duration_hours)
        self.dedup_radius = deduplication_radius_km

    def compute_priority(self, hazard_prob: float, exposure_criticality: float, 
                         connectivity_impact: float, uncertainty: float) -> AlertPriority:
        uncertainty_penalty = min(0.5, uncertainty)
        score = hazard_prob * exposure_criticality * (1.0 + connectivity_impact) * (1.0 - uncertainty_penalty)
        if score > 0.8:
            return AlertPriority.P1
        elif score > 0.5:
            return AlertPriority.P2
        elif score > 0.2:
            return AlertPriority.P3
        else:
            return AlertPriority.P4

    async def check_hysteresis(self, lat: float, lon: float, new_priority: AlertPriority) -> AlertPriority:
        return new_priority

    async def deduplicate(self, lat: float, lon: float, priority: AlertPriority) -> Optional[str]:
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

    async def evaluate(self, fusion_result: Any, exposure_result: dict) -> Optional[Alert]:
        exposure_criticality = max(0.1, exposure_result.get("exposure_criticality", 0.0))
        confidence_map = {"HIGH": 0.1, "MEDIUM": 0.5, "LOW": 0.9}
        uncertainty = confidence_map.get(fusion_result.assessment_confidence, 1.0)

        raw_priority = self.compute_priority(
            fusion_result.hazard_evidence_score,
            exposure_criticality,
            0.0,
            uncertainty
        )
        
        if raw_priority == AlertPriority.P4 and fusion_result.hazard_evidence_score < 0.3:
            return None

        try:
            priority = await self.check_hysteresis(fusion_result.location['lat'], fusion_result.location['lon'], raw_priority)
            dedup_id = await self.deduplicate(fusion_result.location['lat'], fusion_result.location['lon'], priority)
            
            if dedup_id:
                logger.info(f"Alert deduplicated with existing alert {dedup_id}")
                return None

            data_mode = "LIVE" if fusion_result.data_freshness.get("rainfall") == "LIVE" else "REPLAY"
            
            # Deterministic UUID for Idempotency
            seed_str = f"ALERT_{data_mode}_{fusion_result.location['lat']:.5f}_{fusion_result.location['lon']:.5f}_{fusion_result.timestamp.isoformat()}"
            alert_id_uuid = str(uuid.uuid5(uuid.NAMESPACE_OID, seed_str))
            alert_id = f"ALT-{alert_id_uuid[:8].upper()}"
            
            alert = Alert(
                alert_id=alert_id,
                location=fusion_result.location,
                priority=priority,
                severity=priority.split('_')[0],
                reason=fusion_result.explainability_report,
                evidence=fusion_result.contributing_factors,
                confidence=1.0 - uncertainty,
                affected_assets={
                    "buildings": exposure_result.get("buildings_exposed", 0),
                    "hospitals": exposure_result.get("hospitals_exposed", 0),
                    "schools": exposure_result.get("schools_exposed", 0),
                    "road_segments": exposure_result.get("road_segments_exposed", 0)
                },
                recommended_action=self.get_recommended_action(priority, exposure_result),
                timestamp=fusion_result.timestamp,
                status="ACTIVE",
                is_escalated=False
            )
            
            # PostGIS Persistence
            if self.db is not None:
                query = text("""
                    INSERT INTO alerts (
                        id, severity, status, title, description, affected_area, 
                        issued_at, source_type
                    ) VALUES (
                        :id, :severity, :status, :title, :description, 
                        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 
                        :issued_at, :source_type
                    ) ON CONFLICT (id) DO NOTHING
                """)
                # Handle enum mapping
                pg_severity = "LOW"
                if alert.severity == "P1": pg_severity = "EXTREME"
                elif alert.severity == "P2": pg_severity = "SEVERE"
                elif alert.severity == "P3": pg_severity = "HIGH"
                elif alert.severity == "P4": pg_severity = "MODERATE"
                
                await self.db.execute(query, {
                    "id": alert_id_uuid,
                    "severity": pg_severity,
                    "status": "ACTIVE",
                    "title": f"Landslide Alert {alert_id}",
                    "description": alert.reason,
                    "lon": alert.location['lon'],
                    "lat": alert.location['lat'],
                    "issued_at": alert.timestamp,
                    "source_type": data_mode
                })
                await self.db.commit()

            logger.info(f"Generated {priority} alert {alert_id} for {alert.location}")
            
            # WebSocket Broadcast
            ws_payload = {
                "type": "NEW_ALERT",
                "data": alert.dict()
            }
            # Only broadcast if it's a live/replay run that is meant to push to UI
            # We wrap it in a background task to not block DB commits
            import asyncio
            asyncio.create_task(ws_manager.broadcast(ws_payload))

            return alert
                
        except Exception as e:
            logger.error(f"Error evaluating alert: {e}")
            if self.db is not None:
                await self.db.rollback()
            return None
