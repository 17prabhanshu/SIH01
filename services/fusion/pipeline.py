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
    assessment_status: str
    hazard_evidence_score: float
    calibrated_probability: Optional[float]
    evidence_coverage: float
    model_agreement: Optional[float]
    assessment_confidence: str
    contributing_factors: Dict[str, float]
    data_freshness: Dict[str, str]
    missing_data: List[str]
    explainability_report: str

class FusionPipeline:
    def __init__(self, db: AsyncSession):
        self.db = db
        # Total number of expected independent evidence layers
        self.TOTAL_EVIDENCE_LAYERS = 6 

    async def collect_evidence(self, lat: float, lon: float, time_context: datetime = None) -> Dict[str, Any]:
        """Collect latest data gracefully from all independent evidence sources."""
        from services.ingestion.openmeteo import OpenMeteoAdapter
        from services.ingestion.lhasa import LhasaAdapter
        from datetime import datetime, timezone, timedelta
        
        # Default to LIVE now if no context provided
        now = time_context if time_context else datetime.now(timezone.utc)
        
        evidence = {
            "rainfall_24h": None,
            "rainfall_72h": None,
            "elevation": None,
            "insar_deformation": None,
            "sar_amplitude_change": None,
            "optical_change": None,
            "lhasa_nowcast": None,
            "ner_susceptibility_model": None
        }
        
        freshness = {
            "rainfall": "UNAVAILABLE",
            "elevation": "UNAVAILABLE",
            "insar_deformation": "UNAVAILABLE",
            "sar_amplitude_change": "UNAVAILABLE",
            "optical_change": "UNAVAILABLE",
            "lhasa_nowcast": "UNAVAILABLE",
            "ner_susceptibility_model": "UNAVAILABLE"
        }
        missing = ["insar_deformation", "sar_amplitude_change", "optical_change", "ner_susceptibility_model"]

        # Fetch Open-Meteo
        adapter = OpenMeteoAdapter()
        try:
            conditions = await adapter.fetch_current_conditions(lat, lon, time_context=time_context)
            if conditions["status"] == "SUCCESS":
                evidence["rainfall_24h"] = conditions.get("rainfall_24h")
                evidence["rainfall_72h"] = conditions.get("rainfall_72h")
                evidence["elevation"] = conditions.get("elevation")
                freshness["rainfall"] = "HISTORICAL" if time_context else "LIVE"
                freshness["elevation"] = "HISTORICAL" if time_context else "LIVE"
            else:
                missing.extend(["rainfall", "elevation"])
        except Exception as e:
            logger.error(f"Failed to fetch rainfall: {e}")
            missing.extend(["rainfall", "elevation"])
        finally:
            await adapter.close()
            
        # Fetch LHASA
        lhasa = LhasaAdapter()
        lhasa_result = lhasa.get_lhasa_assessment(lat, lon)
        if lhasa_result["status"] == "SUCCESS":
            evidence["lhasa_nowcast"] = lhasa_result["value"]
            freshness["lhasa_nowcast"] = "HISTORICAL" if time_context else "LIVE"
        elif lhasa_result["status"] == "HISTORICAL":
            evidence["lhasa_nowcast"] = lhasa_result["value"]
            freshness["lhasa_nowcast"] = "HISTORICAL"
        else:
            freshness["lhasa_nowcast"] = lhasa_result["status"] # e.g. AUTH_REQUIRED
            missing.append("lhasa_nowcast")
            
        # Fetch Sentinel-1 SAR Change
        from services.geospatial.gee.sentinel1 import Sentinel1Adapter
        try:
            s1_adapter = Sentinel1Adapter(project_id="pure-wall-462105-q9")
            
            # Causal Temporal Bounds: 
            # Pre-event: 45 days prior to 15 days prior to 'now'
            # Post-event: 15 days prior to 'now'
            post_end = now.strftime('%Y-%m-%d')
            post_start = (now - timedelta(days=15)).strftime('%Y-%m-%d')
            pre_end = post_start
            pre_start = (now - timedelta(days=45)).strftime('%Y-%m-%d')
            
            # We enforce causal retrieval: if time_context is provided, we use exact strict bounds leading up to the context.
            # However, for the Oct 2023 prototype replay, we want to capture the specific Oct 2 and Oct 7 scenes when they enter the window.
            # So if we are in Oct 2023, let's use the actual bounding logic dynamically.
            s1_result = s1_adapter.get_sar_change_metric(
                lat=lat, lon=lon,
                pre_start=pre_start, pre_end=pre_end,
                post_start=post_start, post_end=post_end
            )
            
            if s1_result["status"] in ["HISTORICAL", "LIVE"] and s1_result["value"] is not None:
                evidence["sar_amplitude_change"] = s1_result["value"]
                freshness["sar_amplitude_change"] = "HISTORICAL" if time_context else s1_result["status"]
                if "sar_amplitude_change" in missing:
                    missing.remove("sar_amplitude_change")
            else:
                freshness["sar_amplitude_change"] = s1_result["status"]
        except Exception as e:
            logger.error(f"Failed to fetch Sentinel-1 data: {e}")
            freshness["sar_amplitude_change"] = "GEE_ERROR"
            
        return {"evidence": evidence, "freshness": freshness, "missing": missing}

    async def run_susceptibility_model(self, lat: float, lon: float, elevation: float = 0.0) -> Tuple[Optional[float], str]:
        """
        Run base susceptibility model through strict ML inference contract.
        Returns: (probability, status_reason)
        """
        from ml.susceptibility.model import SusceptibilityModel
        import numpy as np
        
        # Instantiate model (in reality this would be loaded from registry/cache)
        model = SusceptibilityModel(model_type="rf", calibration=True)
        # Attempt to run predict (which will enforce OOD and BLOCKED checks)
        dummy_features = np.array([[elevation, 0, 0]]) # Dummy for API parity
        metadata = {"lat": lat, "lon": lon, "provenance": "API Request"}
        
        result = model.predict(dummy_features, metadata)
        
        if result["model_status"] == "BLOCKED" or result["probability_status"] == "UNAVAILABLE":
            logger.info(f"ML Model blocked inference: {result['reason']}")
            return None, result["model_status"]
            
        # Return probability from index 0 if it somehow succeeded
        prob = result["prediction"][0] if result["prediction"] else None
        return prob, result["model_status"]

    def run_rainfall_trigger_model(self, rainfall_24h: Optional[float], rainfall_72h: Optional[float], susceptibility: Optional[float]) -> Optional[float]:
        """Run rainfall trigger model (Heuristic)"""
        if rainfall_24h is None or rainfall_72h is None:
            return None
            
        # Empirical heuristic trigger logic based on raw rainfall depth
        trigger = min(1.0, (rainfall_24h / 100.0) * 0.5 + (rainfall_72h / 200.0) * 0.5)
        
        if susceptibility is not None:
            trigger = min(1.0, trigger * 0.8 + susceptibility * 0.2)
            
        return trigger

    def compute_evidence_fusion(self, evidence: Dict[str, Any], trigger_prob: Optional[float]) -> float:
        """Compute an uncalibrated heuristic evidence score handling UNAVAILABLE components."""
        base_score = trigger_prob if trigger_prob is not None else 0.0
        
        if evidence.get("insar_deformation") is not None and evidence["insar_deformation"] > 0.01:
            base_score = min(1.0, base_score + 0.3)
            
        if evidence.get("lhasa_nowcast") is not None:
            if base_score == 0.0:
                base_score = evidence["lhasa_nowcast"]
            else:
                base_score = base_score * 0.6 + evidence["lhasa_nowcast"] * 0.4
                
        if evidence.get("sar_amplitude_change") is not None:
            # Absolute change magnitude indicates severe surface disturbance
            sar_anomaly = abs(evidence["sar_amplitude_change"])
            if sar_anomaly > 0.1: # Threshold of significance in dB change
                # Log ratio > 0.1 or < -0.1 is anomalous
                # Modulate the base score upward by up to 0.4
                base_score = min(1.0, base_score + (sar_anomaly * 0.5))
            
        return base_score

    def compute_model_agreement(self, probs: List[float]) -> Optional[float]:
        """Compute agreement between different models (variance-based).
        Must return None if fewer than 2 active independent models are available.
        """
        if not probs or len(probs) < 2:
            return None
        mean = sum(probs) / len(probs)
        variance = sum((p - mean) ** 2 for p in probs) / len(probs)
        agreement = max(0.0, 1.0 - (variance * 4)) # rough scaling
        return agreement

    def compute_evidence_coverage(self, active_count: int) -> float:
        """Compute percentage of active evidence layers."""
        return active_count / self.TOTAL_EVIDENCE_LAYERS

    def generate_explainability(self, hazard_score: float, factors: Dict[str, float], missing: List[str]) -> str:
        """Generate human-readable explainability report"""
        report = f"Hazard evidence score computed at {hazard_score:.3f}. "
        valid_factors = {k: v for k, v in factors.items() if v is not None}
        top_factor = max(valid_factors.items(), key=lambda x: x[1]) if valid_factors else ("None", 0)
        report += f"Primary contributing evidence: {top_factor[0]} ({top_factor[1]:.3f}). "
        
        report += "A calibrated landslide probability cannot be produced because the NER susceptibility model and additional independent hazard-evidence layers are unavailable."
        return report

    def _get_deterministic_id(self, lat: float, lon: float, timestamp: datetime, data_mode: str) -> str:
        """Generate deterministic UUID based on event context to prevent duplicate replay records."""
        import uuid
        seed_str = f"FUSION_{data_mode}_{lat:.5f}_{lon:.5f}_{timestamp.isoformat()}"
        return str(uuid.uuid5(uuid.NAMESPACE_OID, seed_str))

    async def store_result(self, result: FusionResult):
        """Store results with full provenance in DB"""
        
        # 1. Get Model ID
        query_model = text("SELECT id FROM model_registry WHERE name = 'fusion_pipeline' AND version = '1.0' LIMIT 1")
        model_result = await self.db.execute(query_model)
        row = model_result.first()
        if not row:
            logger.error("Fusion Pipeline model not registered in DB.")
            return
            
        model_id = row[0]
        data_mode = "REPLAY" if "HISTORICAL" in result.data_freshness.values() else "LIVE"
        run_id = self._get_deterministic_id(result.location['lat'], result.location['lon'], result.timestamp, data_mode)
        
        # 2. Insert into model_runs
        import json
        query_run = text("""
            INSERT INTO model_runs (
                id, model_id, run_start, run_end, status, configuration, logs
            ) VALUES (
                :id, :model_id, :run_start, :run_end, :status, :configuration, :logs
            ) ON CONFLICT (id) DO UPDATE SET 
                configuration = EXCLUDED.configuration,
                logs = EXCLUDED.logs
        """)
        
        config = {
            "lat": result.location['lat'], 
            "lon": result.location['lon'], 
            "data_mode": data_mode,
            "coverage": result.evidence_coverage,
            "agreement": result.model_agreement
        }
        
        await self.db.execute(query_run, {
            "id": run_id,
            "model_id": model_id,
            "run_start": result.timestamp,
            "run_end": result.timestamp,
            "status": "SUCCESS" if result.assessment_status == "SUFFICIENT EVIDENCE" else "FAILED",
            "configuration": json.dumps(config),
            "logs": result.explainability_report
        })
        
        # 3. Insert into model_predictions
        query_pred = text("""
            INSERT INTO model_predictions (
                id, run_id, geom, hazard_evidence_score, severity, prediction_timestamp
            ) VALUES (
                :id, :run_id, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 
                :hazard_evidence_score, :severity, :prediction_timestamp
            ) ON CONFLICT (id, created_at) DO NOTHING
        """)
        
        pred_id = self._get_deterministic_id(result.location['lat'], result.location['lon'], result.timestamp, data_mode + "_PRED")
        
        await self.db.execute(query_pred, {
            "id": pred_id,
            "run_id": run_id,
            "lon": result.location['lon'],
            "lat": result.location['lat'],
            "hazard_evidence_score": result.hazard_evidence_score, 
            "severity": "HIGH" if result.hazard_evidence_score > 0.5 else "LOW",
            "prediction_timestamp": result.timestamp
        })
        
        await self.db.commit()

    def get_assessment_confidence(self, coverage: float) -> str:
        """Rule-based confidence based on evidence coverage."""
        if coverage >= 0.8:
            return "HIGH"
        if coverage >= 0.5:
            return "MEDIUM"
        return "LOW"

    async def run(self, lat: float, lon: float, time_context: datetime = None) -> FusionResult:
        """Orchestrate the full evidence chain"""
        req_id = str(uuid.uuid4())
        logger.info(f"[{req_id}] Starting fusion pipeline for {lat}, {lon}")
        
        # 1. Collect Data
        data_collection = await self.collect_evidence(lat, lon, time_context=time_context)
        evidence = data_collection["evidence"]
        freshness = data_collection["freshness"]
        missing = data_collection["missing"]
        
        # 2. Run Models
        susceptibility, ml_status = await self.run_susceptibility_model(lat, lon, evidence.get("elevation", 0.0))
        freshness["ner_susceptibility_model"] = ml_status
        trigger_prob = self.run_rainfall_trigger_model(
            evidence.get("rainfall_24h"), 
            evidence.get("rainfall_72h"),
            susceptibility
        )
        
        # 3. Evidence Fusion
        hazard_evidence_score = self.compute_evidence_fusion(evidence, trigger_prob)
        
        # 4. Coverage and Agreement
        # Agreement is ONLY calculated across independent models, not the final fused score.
        independent_models = [
            trigger_prob,
            susceptibility,
            evidence.get("lhasa_nowcast"),
            evidence.get("insar_deformation"),
            evidence.get("sar_amplitude_change"),
            evidence.get("optical_change")
        ]
        model_probs = [p for p in independent_models if p is not None]
        model_agreement = self.compute_model_agreement(model_probs)
        
        active_count = self.TOTAL_EVIDENCE_LAYERS - len(missing)
        evidence_coverage = self.compute_evidence_coverage(active_count)
        assessment_confidence = self.get_assessment_confidence(evidence_coverage)
        assessment_status = "LIMITED EVIDENCE" if evidence_coverage < 0.5 else "SUFFICIENT EVIDENCE"
        
        # 5. Explainability
        factors = {
            "susceptibility": susceptibility,
            "rainfall_trigger": trigger_prob,
            "elevation": evidence.get("elevation"),
            "sar_amplitude_change": evidence.get("sar_amplitude_change")
        }
        
        report = self.generate_explainability(hazard_evidence_score, factors, missing)
        
        result = FusionResult(
            request_id=req_id,
            timestamp=time_context if time_context else datetime.now(timezone.utc),
            location={"lat": lat, "lon": lon},
            assessment_status=assessment_status,
            hazard_evidence_score=hazard_evidence_score,
            calibrated_probability=None, # Explicitly UNAVAILABLE per scientific mandate
            evidence_coverage=evidence_coverage,
            model_agreement=model_agreement,
            assessment_confidence=assessment_confidence,
            contributing_factors=factors,
            data_freshness=freshness,
            missing_data=missing,
            explainability_report=report
        )
        
        # 6. Store
        if self.db is not None:
            try:
                await self.store_result(result)
            except Exception as e:
                logger.error(f"[{req_id}] Failed to store fusion result: {e}")
            
        logger.info(f"[{req_id}] Fusion pipeline completed. Hazard Evidence Score: {hazard_evidence_score:.3f}")
        return result

