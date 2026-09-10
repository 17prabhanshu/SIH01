from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from datetime import datetime
import xgboost as xgb
import numpy as np

from .model_agreement import ModelAgreementTracker
from .uncertainty import UncertaintyEngine

@dataclass
class EvidenceLayer:
    model_name: str
    prediction: Any
    probability: float
    confidence: float
    evidence_strength: str  # "HIGH", "MEDIUM", "LOW", "UNAVAILABLE"
    last_updated: datetime
    data_mode: str
    uncertainty: float

@dataclass
class FusionResult:
    probability: float
    uncertainty: float
    evidence_quality: str
    model_agreement: Dict[str, Any]
    data_freshness: Dict[str, str]
    contributing_factors: List[Dict[str, Any]]
    confidence_reducers: List[str]

class EvidenceFusion:
    """Multimodal Evidence Fusion Model for Landslide Early Warning."""
    
    def __init__(self, mode: str = "baseline"):
        self.mode = mode
        self.agreement_tracker = ModelAgreementTracker()
        self.uncertainty_engine = UncertaintyEngine()
        
        if mode == "advanced":
            self.model = xgb.XGBClassifier(
                use_label_encoder=False,
                eval_metric="logloss"
            )
            self.is_trained = False
            
    def fuse(self, evidence_layers: Dict[str, EvidenceLayer]) -> FusionResult:
        """
        Fuse multiple evidence layers into a unified hazard probability.
        Handles missing data explicitly.
        """
        if self.mode == "baseline":
            return self._fuse_baseline(evidence_layers)
        elif self.mode == "advanced":
            if not self.is_trained:
                raise RuntimeError("Advanced XGBoost fusion model not trained.")
            return self._fuse_advanced(evidence_layers)
        else:
            raise ValueError(f"Unknown fusion mode: {self.mode}")
            
    def _fuse_baseline(self, layers: Dict[str, EvidenceLayer]) -> FusionResult:
        """Weighted scientific scoring (transparent & interpretable)."""
        
        # Weights definition based on modality reliability in NER
        weights = {
            "susceptibility": 0.25,
            "rainfall_trigger": 0.35,
            "lhasa": 0.15,
            "insar": 0.15,
            "optical": 0.10
        }
        
        fused_prob = 0.0
        total_weight = 0.0
        freshness_dict = {}
        contributing = []
        reducers = []
        
        current_time = datetime.utcnow()
        
        for name, layer in layers.items():
            # Stale data penalty
            age_hours = (current_time - layer.last_updated).total_seconds() / 3600.0
            stale_penalty = 1.0
            freshness_status = "FRESH"
            
            if age_hours > 72 and layer.data_mode != "STATIC":
                stale_penalty = 0.5
                freshness_status = "STALE"
                reducers.append(f"{name} data is stale (>72h).")
            elif age_hours > 24 and layer.data_mode != "STATIC":
                stale_penalty = 0.8
                freshness_status = "DELAYED"
                
            freshness_dict[name] = freshness_status
            
            # Missing data awareness
            if layer.evidence_strength == "UNAVAILABLE":
                reducers.append(f"{name} evidence unavailable.")
                continue
                
            weight = weights.get(name, 0.1) * stale_penalty
            fused_prob += layer.probability * weight
            total_weight += weight
            
            contributing.append({
                "factor": name,
                "magnitude": layer.probability,
                "direction": "POSITIVE" if layer.probability > 0.5 else "NEGATIVE"
            })
            
        # Normalize
        if total_weight > 0:
            fused_prob = fused_prob / total_weight
        else:
            fused_prob = 0.0
            
        # Compute agreement and uncertainty
        agreement = self.agreement_tracker.compute_agreement(layers)
        uncertainty = self.uncertainty_engine.compute_uncertainty(layers)
        
        # Overall evidence quality
        if uncertainty < 0.3 and total_weight > 0.7:
            overall_quality = "HIGH"
        elif uncertainty < 0.6 and total_weight > 0.4:
            overall_quality = "MEDIUM"
        elif total_weight > 0:
            overall_quality = "LOW"
        else:
            overall_quality = "INSUFFICIENT"
            
        return FusionResult(
            probability=fused_prob,
            uncertainty=uncertainty,
            evidence_quality=overall_quality,
            model_agreement=agreement,
            data_freshness=freshness_dict,
            contributing_factors=contributing,
            confidence_reducers=reducers
        )

    def _fuse_advanced(self, layers: Dict[str, EvidenceLayer]) -> FusionResult:
        """
        Advanced ML fusion (XGBoost).
        Expects a trained model that handles missing values natively via XGBoost's missing value feature.
        """
        # Placeholder for advanced XGBoost feature extraction and predict_proba
        # In a real system, you map evidence_layers to a fixed feature vector and call self.model.predict_proba()
        pass
