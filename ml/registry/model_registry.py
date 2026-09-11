import enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any

class ModelStatus(enum.Enum):
    PRODUCTION = "PRODUCTION"
    CANDIDATE = "CANDIDATE"
    VALIDATED = "VALIDATED"
    EXPERIMENTAL = "EXPERIMENTAL"
    RESEARCH = "RESEARCH"
    BLOCKED = "BLOCKED"
    DISABLED = "DISABLED"
    OUT_OF_DOMAIN = "OUT_OF_DOMAIN"
    DEVELOPMENT_BENCHMARK = "DEVELOPMENT_BENCHMARK"

@dataclass
class ModelInfo:
    model_id: str
    name: str
    version: str
    status: ModelStatus
    license: str
    description: str
    input_modalities: List[str]
    output_type: str
    resolution: str
    geographic_scope: str
    temporal_scope: str
    trigger_type: str
    validation_region: str
    validation_metrics: Dict[str, float]
    calibration_status: str
    known_limitations: List[str]
    training_data: str
    dataset_version: str
    feature_version: str
    compute_requirements: str
    spatial_split: str = "UNAVAILABLE"
    ood_status: str = "UNAVAILABLE"
    artifact_location: str = ""
    last_updated: datetime = field(default_factory=datetime.utcnow)

class ModelRegistry:
    """Registry for managing and tracking all models used in the platform."""
    
    def __init__(self):
        self._models: Dict[str, ModelInfo] = {}
        self._register_default_models()
        
    def register_model(self, model_info: ModelInfo) -> None:
        """Register a new model or update an existing one."""
        self._models[model_info.model_id] = model_info
        
    def get_model(self, model_id: str) -> Optional[ModelInfo]:
        """Retrieve model metadata by ID."""
        return self._models.get(model_id)
        
    def list_models(self) -> List[ModelInfo]:
        """Return all registered models."""
        return list(self._models.values())
        
    def get_models_by_status(self, status: ModelStatus) -> List[ModelInfo]:
        """Filter models by their operational status."""
        return [m for m in self._models.values() if m.status == status]
        
    def _register_default_models(self):
        """Pre-register all investigated models with strictly truthful metadata. Fake metrics are purged."""
        
        self.register_model(ModelInfo(
            model_id="susceptibility_rf",
            name="RF-Benchmark-v1",
            version="1.0.0",
            status=ModelStatus.DEVELOPMENT_BENCHMARK,
            license="Open Data (Benchmark)",
            description="Random Forest baseline trained on Benchmark dataset. NOT VALIDATED FOR NER.",
            input_modalities=["DEM", "Slope", "Rainfall"],
            output_type="Hazard Evidence Score (0-1)",
            resolution="30m",
            geographic_scope="Benchmark Dataset Domain",
            temporal_scope="Static",
            trigger_type="None (Static)",
            validation_region="SPATIAL HOLDOUT",
            validation_metrics={},
            calibration_status="PLATT SCALING",
            known_limitations=["Domain mismatch: Not trained on NER labels", "Model cannot output calibrated probabilities for NER region", "OOD constraints apply"],
            training_data="Landslide Benchmark",
            dataset_version="benchmark_v1",
            feature_version="v1.0",
            compute_requirements="Standard CPU",
            spatial_split="GRID_BLOCK_HOLDOUT",
            ood_status="STRICT_CHECK",
            artifact_location="ml/artifacts/susceptibility_rf_v1.joblib"
        ))
        
        self.register_model(ModelInfo(
            model_id="rainfall_trigger",
            name="Empirical Rainfall Trigger Model",
            version="1.1.0",
            status=ModelStatus.EXPERIMENTAL,
            license="Proprietary/Internal",
            description="Threshold-based rainfall trigger model combining Intensity-Duration curves and cumulative thresholds.",
            input_modalities=["IMD Gridded Rainfall"],
            output_type="Alert Category (NORMAL/ELEVATED/HIGH/EXTREME)",
            resolution="0.25 degree",
            geographic_scope="NER (Assam/Sikkim)",
            temporal_scope="Real-time / 72h antecedent",
            trigger_type="Rainfall",
            validation_region="None (Rule-based)",
            validation_metrics={},
            calibration_status="N/A",
            known_limitations=["Thresholds are empirical, not statistically calibrated against authoritative events"],
            training_data="None",
            dataset_version="v0",
            feature_version="v1.0",
            compute_requirements="Low (CPU)"
        ))
        
        self.register_model(ModelInfo(
            model_id="lhasa_regional",
            name="NASA LHASA Integration",
            version="2.0",
            status=ModelStatus.PRODUCTION,
            license="Open Source (NASA)",
            description="Integration of the global LHASA model as an independent evidence layer for the NER region.",
            input_modalities=["GPM IMERG", "Global Susceptibility Map"],
            output_type="Hazard Level",
            resolution="1km",
            geographic_scope="Global",
            temporal_scope="Real-time",
            trigger_type="Rainfall",
            validation_region="Global",
            validation_metrics={},
            calibration_status="N/A",
            known_limitations=["Coarse resolution", "Not optimized for local geology"],
            training_data="NASA global datasets",
            dataset_version="lhasa_v2",
            feature_version="N/A",
            compute_requirements="API Integration"
        ))
        
        self.register_model(ModelInfo(
            model_id="landslide4sense_unet",
            name="Optical Segmentation Baseline (L4S)",
            version="1.0.0",
            status=ModelStatus.RESEARCH,
            license="Research/Academic",
            description="Deep learning baseline for landslide semantic segmentation using multispectral data. strictly benchmark only.",
            input_modalities=["Sentinel-2 Multispectral"],
            output_type="Binary Mask",
            resolution="10m",
            geographic_scope="Global Benchmark",
            temporal_scope="Event-based",
            trigger_type="Optical imagery availability",
            validation_region="Landslide4Sense Benchmark Region (NOT NER)",
            validation_metrics={},
            calibration_status="UNCALIBRATED",
            known_limitations=["Domain mismatch: Trained on global dataset, not validated for NER region.", "Cloud cover dependency"],
            training_data="Landslide4Sense Dataset",
            dataset_version="l4s_v1",
            feature_version="optical_v1",
            compute_requirements="High (GPU, min 16GB VRAM)"
        ))

# Singleton instance
registry = ModelRegistry()
