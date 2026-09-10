import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/models", tags=["models"])

@router.get("")
async def list_models() -> List[Dict[str, Any]]:
    """List all registered models with their current status"""
    return [
        {
            "id": "susceptibility_v2",
            "name": "Static Susceptibility Model",
            "version": "2.1.0",
            "status": "ACTIVE",
            "last_updated": "2023-09-01T00:00:00Z"
        },
        {
            "id": "rainfall_trigger_v1",
            "name": "Dynamic Rainfall Trigger Model",
            "version": "1.0.5",
            "status": "ACTIVE",
            "last_updated": "2023-10-01T00:00:00Z"
        },
        {
            "id": "polsar_experimental",
            "name": "PolSAR Change Detection",
            "version": "0.9.0",
            "status": "EXPERIMENTAL",
            "last_updated": "2023-10-15T00:00:00Z"
        }
    ]

@router.get("/{model_id}")
async def get_model_details(model_id: str) -> Dict[str, Any]:
    """Get specific model details and model card"""
    if model_id == "susceptibility_v2":
        return {
            "id": model_id,
            "name": "Static Susceptibility Model",
            "description": "Geomorphological susceptibility model using elevation, slope, aspect, and geology.",
            "inputs": ["DEM", "Slope", "Geology", "Land Cover"],
            "outputs": ["Susceptibility Index (0-1)"],
            "limitations": "Does not account for dynamic triggers.",
            "developer": "NER-LEWS Science Team"
        }
    raise HTTPException(status_code=404, detail="Model not found")

@router.get("/{model_id}/metrics")
async def get_model_metrics(model_id: str) -> Dict[str, Any]:
    """Get latest performance metrics for a model"""
    return {
        "id": model_id,
        "metrics_date": "2023-10-01T00:00:00Z",
        "auc_roc": 0.89,
        "f1_score": 0.82,
        "precision": 0.85,
        "recall": 0.80,
        "drift_detected": False
    }

@router.get("/comparison/location")
async def get_model_comparison(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
) -> Dict[str, Any]:
    """Get per-model predictions at a specific location to analyze agreement"""
    return {
        "location": {"lat": lat, "lon": lon},
        "predictions": {
            "susceptibility_v2": 0.45,
            "rainfall_trigger_v1": 0.60,
            "lhasa_nowcast": 0.55
        },
        "model_agreement_score": 0.85, # High agreement
        "variance": 0.005
    }
