import numpy as np
from typing import Dict, Any, List, Tuple
from dataclasses import dataclass
from sklearn.ensemble import RandomForestClassifier

from .thresholds import EmpiricalThresholds

@dataclass
class RainFeatures:
    current_rainfall: float
    rain_1h: float
    rain_24h: float
    rain_72h: float
    rain_7d_cumulative: float
    antecedent_rainfall: float
    rainfall_intensity: float
    rainfall_anomaly: float
    soil_moisture: float
    temperature: float
    state: str

class RainfallTriggerModel:
    """
    Combined Empirical and ML model for forecasting rainfall-induced landslides.
    """
    def __init__(self):
        self.empirical_engine = EmpiricalThresholds()
        self.ml_model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.is_trained = False
        
    def train(self, X: np.ndarray, y: np.ndarray):
        """Train the ML component on historical landslide/rainfall pairs."""
        self.ml_model.fit(X, y)
        self.is_trained = True

    def predict(self, features: RainFeatures) -> Dict[str, Any]:
        """
        Predict rainfall trigger probability and categorize risk.
        """
        # 1. Evaluate Empirical Thresholds
        id_exceeded, margin = self.empirical_engine.evaluate_id_threshold(
            features.state, 
            features.rainfall_intensity, 
            duration_h=24.0 # Assume 24h event for this evaluation block
        )
        
        cumul_exceeded, critical_factor = self.empirical_engine.evaluate_cumulative_threshold(
            features.state,
            features.rain_24h,
            features.rain_72h,
            features.rain_7d_cumulative
        )
        
        threshold_exceeded = id_exceeded or cumul_exceeded
        
        # 2. Evaluate ML Probability (if trained)
        trigger_probability = 0.0
        if self.is_trained:
            x_input = np.array([[
                features.current_rainfall, features.rain_1h, features.rain_24h,
                features.rain_72h, features.rain_7d_cumulative, features.antecedent_rainfall,
                features.rainfall_intensity, features.rainfall_anomaly, 
                features.soil_moisture, features.temperature
            ]])
            trigger_probability = self.ml_model.predict_proba(x_input)[0, 1]
        else:
            # Fallback heuristic probability based on thresholds
            if id_exceeded and cumul_exceeded:
                trigger_probability = 0.85
            elif cumul_exceeded:
                trigger_probability = 0.65
            elif id_exceeded:
                trigger_probability = 0.55
            else:
                # Scale by margin
                safety = max(0, margin)
                trigger_probability = max(0, 0.4 - (safety / 100.0))

        # 3. Categorize Alert Level
        category = "NORMAL"
        if trigger_probability >= 0.8 or (id_exceeded and cumul_exceeded):
            category = "EXTREME"
        elif trigger_probability >= 0.6 or cumul_exceeded:
            category = "HIGH"
        elif trigger_probability >= 0.4 or id_exceeded:
            category = "ELEVATED"

        return {
            "trigger_probability": trigger_probability,
            "threshold_exceeded": threshold_exceeded,
            "rainfall_category": category,
            "margin_of_safety": margin,
            "critical_factor": critical_factor if cumul_exceeded else None,
            "data_quality": {
                "freshness": "live" if features.current_rainfall >= 0 else "stale",
                "completeness": 1.0,
                "source": "IMD/AWS"
            }
        }
