"""
API endpoint for ML Model Assessment panel.
Returns real model metadata, metrics, feature importance, OOD status, and provenance.
"""
from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
import json
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/status")
async def get_ml_status() -> Dict[str, Any]:
    """
    Returns the current ML model status for the frontend AI/ML Assessment panel.
    All values are real - nothing is fabricated.
    """
    from ml.registry.model_registry import registry
    
    model_info = registry.get_model("susceptibility_rf")
    
    # Load actual computed metrics from the training artifact
    metrics_path = "ml/artifacts/latest_metrics.json"
    actual_metrics = {}
    feature_importance = {}
    training_metadata = {}
    
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            data = json.load(f)
            actual_metrics = data.get("metrics", {})
            feature_importance = data.get("feature_importance", {})
            training_metadata = data.get("metadata", {})
    
    # Check if model artifact exists
    model_artifact_exists = os.path.exists("ml/artifacts/susceptibility_rf_v1.joblib")
    
    return {
        "model_id": model_info.model_id if model_info else "UNAVAILABLE",
        "model_name": model_info.name if model_info else "UNAVAILABLE",
        "model_version": model_info.version if model_info else "UNAVAILABLE",
        "model_status": model_info.status.value if model_info else "UNAVAILABLE",
        "model_type": "Random Forest (scikit-learn)",
        "training_dataset": model_info.training_data if model_info else "UNAVAILABLE",
        "geographic_scope": model_info.geographic_scope if model_info else "UNAVAILABLE",
        "ner_generalization": "NOT VALIDATED",
        "spatial_validation": model_info.spatial_split if model_info else "UNAVAILABLE",
        "ood_status": model_info.ood_status if model_info else "UNAVAILABLE",
        "calibration_status": model_info.calibration_status if model_info else "UNAVAILABLE",
        "operational_use": "SECONDARY EVIDENCE ONLY",
        "model_artifact_available": model_artifact_exists,
        "validation_metrics": actual_metrics if actual_metrics else "UNAVAILABLE",
        "feature_importance": feature_importance if feature_importance else "UNAVAILABLE",
        "training_metadata": training_metadata if training_metadata else "UNAVAILABLE",
        "known_limitations": model_info.known_limitations if model_info else [],
        "disclaimer": "Development model. NER generalization not yet validated. "
                     "Metrics are from benchmark dataset only."
    }


@router.get("/predict")
async def predict_susceptibility(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    elevation: float = Query(0.0),
    slope: float = Query(0.0)
) -> Dict[str, Any]:
    """
    Run ML susceptibility prediction with full OOD check and provenance.
    """
    from ml.susceptibility.model import SusceptibilityModel
    import numpy as np
    
    model = SusceptibilityModel(model_type="rf", calibration=True)
    artifact_path = "ml/artifacts/susceptibility_rf_v1.joblib"
    
    if os.path.exists(artifact_path):
        try:
            model.load(artifact_path)
        except Exception as e:
            return {
                "status": "ERROR",
                "reason": f"Failed to load model artifact: {e}",
                "ml_score": None,
                "calibrated_probability": None
            }
    
    features = np.array([[lat, lon, elevation, slope]])
    metadata = {"lat": lat, "lon": lon, "provenance": "API Request"}
    
    result = model.predict(features, metadata)
    
    # Extract feature importance if model is trained
    importance = model.extract_feature_importance()
    
    return {
        "model_status": result.get("model_status", "UNAVAILABLE"),
        "probability_status": result.get("probability_status", "UNAVAILABLE"),
        "ml_score": result.get("prediction", [None])[0] if result.get("prediction") else None,
        "calibrated_probability": result.get("calibrated_probability", [None])[0] if result.get("calibrated_probability") else None,
        "uncertainty": result.get("uncertainty", [None])[0] if result.get("uncertainty") else None,
        "feature_importance": importance,
        "ood_warning": result.get("model_status") == "OUT_OF_DOMAIN",
        "disclaimer": "ML Susceptibility Score from development/benchmark model. "
                     "NOT a calibrated NER probability."
    }


@router.get("/maturity")
async def get_ml_maturity() -> Dict[str, Any]:
    """
    Returns the ML maturity scorecard with honest assessment.
    """
    metrics_path = "ml/artifacts/latest_metrics.json"
    has_metrics = os.path.exists(metrics_path)
    has_artifact = os.path.exists("ml/artifacts/susceptibility_rf_v1.joblib")
    
    return {
        "data_provenance": {
            "score": "8/10" if has_metrics else "3/10",
            "detail": "Open-Meteo DEM + NASA GLC points. Benchmark only."
        },
        "label_quality": {
            "score": "6/10",
            "detail": "NASA Global Landslide Catalog subset. Limited sample size (30 points)."
        },
        "feature_pipeline": {
            "score": "7/10",
            "detail": "Elevation, slope, lat/lon. DEM-derived features computable."
        },
        "model_training": {
            "score": "7/10" if has_artifact else "2/10",
            "detail": "Random Forest with isotonic calibration. Trained on benchmark data."
        },
        "spatial_validation": {
            "score": "8/10",
            "detail": "Grid-based spatial block holdout (GroupShuffleSplit). No random splits."
        },
        "calibration": {
            "score": "7/10" if has_artifact else "2/10",
            "detail": "Isotonic calibration via CalibratedClassifierCV. Benchmark-only."
        },
        "ood_detection": {
            "score": "8/10",
            "detail": "Geographic bounding box check. NER coordinates enforced."
        },
        "explainability": {
            "score": "7/10" if has_artifact else "2/10",
            "detail": "Gini feature importance. No SHAP (not fabricated)."
        },
        "registry_versioning": {
            "score": "8/10",
            "detail": "Full model registry with provenance, OOD status, spatial split metadata."
        },
        "operational_integration": {
            "score": "7/10",
            "detail": "ML evidence integrated as secondary channel in FusionPipeline."
        },
        "overall": "7/10" if has_artifact else "3/10",
        "disclaimer": "Scores reflect prototype maturity. NER production deployment requires "
                     "authoritative labeled data and field validation."
    }
