import logging
import uuid
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.engine import Engine

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
    def __init__(self, db_engine: Engine):
        self.db_engine = db_engine

    def collect_evidence(self, lat: float, lon: float) -> Dict[str, Any]:
        """Collect latest data from all sources (rainfall, satellite, sensors)"""
        evidence = {
            "rainfall_24h": None,
            "rainfall_72h": None,
            "insar_deformation": None,
            "optical_tracking": None,
            "sar_change": None,
            "lhasa_nowcast": None
        }
        freshness = {}
        missing = []

        # In a real system, these would be separate DB queries or API calls
        # Here we structure the skeleton with graceful degradation
        try:
            # Query IMD/Rainfall DB
            evidence["rainfall_24h"] = 45.2
            evidence["rainfall_72h"] = 120.5
            freshness["rainfall"] = "1h"
        except Exception:
            missing.append("rainfall")

        try:
            # Query Satellite/InSAR
            evidence["insar_deformation"] = 0.02 # mm/yr or similar
            freshness["insar"] = "7d"
        except Exception:
            missing.append("insar_deformation")
            
        try:
            # Query LHASA
            evidence["lhasa_nowcast"] = 0.6
            freshness["lhasa"] = "3h"
        except Exception:
            missing.append("lhasa")

        return {"evidence": evidence, "freshness": freshness, "missing": missing}

    def run_susceptibility_model(self, lat: float, lon: float) -> float:
        """Run base susceptibility model"""
        return 0.4 # Placeholder for actual model inference

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

    def store_result(self, session: Session, result: FusionResult):
        """Store results with full provenance in DB"""
        # In actual implementation: INSERT INTO fusion_results ...
        pass

    def run(self, lat: float, lon: float) -> FusionResult:
        """Orchestrate the full evidence chain"""
        req_id = str(uuid.uuid4())
        logger.info(f"[{req_id}] Starting fusion pipeline for {lat}, {lon}")
        
        # 1. Collect Data
        data_collection = self.collect_evidence(lat, lon)
        evidence = data_collection["evidence"]
        freshness = data_collection["freshness"]
        missing = data_collection["missing"]
        
        # 2. Run Models
        susceptibility = self.run_susceptibility_model(lat, lon)
        
        trigger_prob = self.run_rainfall_trigger_model(
            evidence.get("rainfall_24h"), 
            evidence.get("rainfall_72h"),
            susceptibility
        )
        
        # 3. Evidence Fusion
        hazard_probability = self.compute_evidence_fusion(evidence, trigger_prob)
        
        # 4. Agreement and Uncertainty
        # (assume we ran 3 different sub-models for demonstration)
        model_probs = [hazard_probability, trigger_prob, evidence.get("lhasa_nowcast") or hazard_probability]
        model_agreement = self.compute_model_agreement(model_probs)
        uncertainty = self.compute_uncertainty(missing, freshness)
        
        # 5. Explainability
        factors = {
            "susceptibility": susceptibility,
            "rainfall_trigger": trigger_prob,
            "insar_impact": evidence.get("insar_deformation", 0.0),
            "lhasa": evidence.get("lhasa_nowcast", 0.0)
        }
        
        report = self.generate_explainability(hazard_probability, factors, missing)
        
        result = FusionResult(
            request_id=req_id,
            timestamp=datetime.now(timezone.utc),
            location={"lat": lat, "lon": lon},
            hazard_probability=hazard_probability,
            uncertainty=uncertainty,
            model_agreement=model_agreement,
            contributing_factors=factors,
            data_freshness=freshness,
            missing_data=missing,
            explainability_report=report
        )
        
        # 6. Store
        try:
            with Session(self.db_engine) as session:
                self.store_result(session, result)
        except Exception as e:
            logger.error(f"[{req_id}] Failed to store fusion result: {e}")
            
        logger.info(f"[{req_id}] Fusion pipeline completed. Hazard: {hazard_probability:.2f}")
        return result
