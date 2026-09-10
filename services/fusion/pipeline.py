import logging
import uuid
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

logger = logging.getLogger(__name__)

@dataclass
class FusionResult:
    request_id: str
    timestamp: datetime
    location: Dict[str, float]
    hazard_probability: float
    uncertainty: float
    model_agreement: float
    contributing_factors: Dict[str, float]
    data_freshness: Dict[str, str]
    missing_data: List[str]
    explainability_report: str

class FusionPipeline:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def collect_evidence(self, lat: float, lon: float) -> Dict[str, Any]:
        """Collect latest data from all sources (rainfall, satellite, sensors)"""
        raise NotImplementedError("Real DB queries must be implemented to fetch evidence. Fake data is prohibited.")

    async def run_susceptibility_model(self, lat: float, lon: float) -> float:
        """Run base susceptibility model"""
        raise NotImplementedError("Model inference pipeline must be implemented here. Fake data is prohibited.")

    def run_rainfall_trigger_model(self, rainfall_24h: float, rainfall_72h: float, susceptibility: float) -> float:
        """Run rainfall trigger model"""
        if rainfall_24h is None or rainfall_72h is None:
            return 0.0
        return min(1.0, (rainfall_24h / 100.0) * 0.4 + (rainfall_72h / 200.0) * 0.4 + susceptibility * 0.2)

    def compute_evidence_fusion(self, evidence: Dict[str, Any], trigger_prob: float) -> float:
        """Fuse different evidence layers"""
        # simplified Bayesian or weighted sum fusion
        base_prob = trigger_prob
        
        if evidence.get("insar_deformation") and evidence["insar_deformation"] > 0.01:
            base_prob = min(1.0, base_prob + 0.2)
            
        if evidence.get("lhasa_nowcast"):
            base_prob = base_prob * 0.7 + evidence["lhasa_nowcast"] * 0.3
            
        return base_prob

    def compute_model_agreement(self, probs: List[float]) -> float:
        """Compute agreement between different models (variance-based)"""
        if not probs:
            return 0.0
        mean = sum(probs) / len(probs)
        variance = sum((p - mean) ** 2 for p in probs) / len(probs)
        # map variance to agreement (0 variance = 1.0 agreement)
        agreement = max(0.0, 1.0 - (variance * 4)) # rough scaling
        return agreement

    def compute_uncertainty(self, missing_data: List[str], freshness: Dict[str, str]) -> float:
        """Compute uncertainty based on missing or stale data"""
        uncertainty = 0.1 # base uncertainty
        uncertainty += len(missing_data) * 0.15
        
        for source, age in freshness.items():
            if age.endswith('d'):
                days = int(age.replace('d', ''))
                if days > 14:
                    uncertainty += 0.1
        
        return min(1.0, uncertainty)

    def generate_explainability(self, hazard_prob: float, factors: Dict[str, float], missing: List[str]) -> str:
        """Generate human-readable explainability report"""
        report = f"Hazard probability computed at {hazard_prob:.2f}. "
        top_factor = max(factors.items(), key=lambda x: x[1]) if factors else ("None", 0)
        report += f"Primary contributing factor: {top_factor[0]} ({top_factor[1]:.2f}). "
        
        if missing:
            report += f"Note: Missing data from {', '.join(missing)} increased uncertainty."
            
        return report

    async def store_result(self, result: FusionResult):
        """Store results with full provenance in DB"""
        query = text("""
            INSERT INTO model_runs (
                model_name, version, parameters, metrics, output_data, run_date, 
                data_mode, provenance_id, status
            ) VALUES (
                :model_name, :version, :parameters, :metrics, :output_data, :run_date,
                :data_mode, :provenance_id, :status
            )
        """)
        await self.db.execute(query, {
            "model_name": "fusion_pipeline",
            "version": "1.0",
            "parameters": '{"lat": ' + str(result.location['lat']) + ', "lon": ' + str(result.location['lon']) + '}',
            "metrics": '{"uncertainty": ' + str(result.uncertainty) + ', "agreement": ' + str(result.model_agreement) + '}',
            "output_data": '{"hazard_probability": ' + str(result.hazard_probability) + '}',
            "run_date": result.timestamp,
            "data_mode": "LIVE",
            "provenance_id": None,
            "status": "SUCCESS"
        })
        await self.db.commit()

    async def run(self, lat: float, lon: float) -> FusionResult:
        """Orchestrate the full evidence chain"""
        req_id = str(uuid.uuid4())
        logger.info(f"[{req_id}] Starting fusion pipeline for {lat}, {lon}")
        
        # 1. Collect Data
        data_collection = await self.collect_evidence(lat, lon)
        
        # Unreachable currently since collect_evidence raises NotImplementedError
        # Below is the structural pipeline once DB is connected
        return None

