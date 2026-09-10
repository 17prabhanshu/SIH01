import enum
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any

class ModelStatus(enum.Enum):
    PRODUCTION = "PRODUCTION"
    VALIDATED = "VALIDATED"
    EXPERIMENTAL = "EXPERIMENTAL"
    RESEARCH = "RESEARCH"
    DISABLED = "DISABLED"

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
    trigger_type: str
    validation_region: str
    validation_metrics: Dict[str, float]
    known_limitations: List[str]
    training_data: str
    compute_requirements: str
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
        """Pre-register all investigated models with accurate metadata."""
        
        self.register_model(ModelInfo(
            model_id="susceptibility_rf",
            name="Random Forest Susceptibility Baseline",
            version="1.0.0",
            status=ModelStatus.PRODUCTION,
            license="Proprietary/Internal",
            description="Static landslide susceptibility mapping using geomorphological, geological, and land-cover features.",
            input_modalities=["DEM", "Lithology", "LULC", "Historical Inventory"],
            output_type="Probability (0-1)",
            resolution="30m",
            geographic_scope="NER",
            trigger_type="None (Static)",
            validation_region="Sikkim & Meghalaya",
            validation_metrics={"roc_auc": 0.82, "pr_auc": 0.65},
            known_limitations=["Underestimates rockfalls", "Sensitive to DEM resolution"],
            training_data="GSI historical inventories 2010-2020",
            compute_requirements="Standard CPU, 16GB RAM"
        ))
        
        self.register_model(ModelInfo(
            model_id="rainfall_trigger",
            name="Empirical Rainfall Trigger Model",
            version="1.1.0",
            status=ModelStatus.PRODUCTION,
            license="Proprietary/Internal",
            description="Threshold-based rainfall trigger model combining Intensity-Duration curves and cumulative thresholds.",
            input_modalities=["IMD Gridded Rainfall", "AWS Data"],
            output_type="Alert Category (NORMAL/ELEVATED/HIGH/EXTREME)",
            resolution="0.25 degree / Point",
            geographic_scope="NER (State-specific calibrated)",
            trigger_type="Rainfall",
            validation_region="Assam, Sikkim",
            validation_metrics={"precision": 0.68, "recall": 0.75},
            known_limitations=["False positives during monsoon peak", "Sparse AWS network interpolation errors"],
            training_data="Historical landslide events and corresponding IMD rainfall data",
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
            geographic_scope="Global (NER masked)",
            trigger_type="Rainfall",
            validation_region="Global",
            validation_metrics={"hr_accuracy": 0.60},
            known_limitations=["Coarse resolution", "Not optimized for local geology"],
            training_data="NASA global datasets",
            compute_requirements="API Integration / Low local compute"
        ))
        
        self.register_model(ModelInfo(
            model_id="sar_event_detection",
            name="SAR Amplitude Change Detection",
            version="0.5.0",
            status=ModelStatus.EXPERIMENTAL,
            license="Proprietary/Internal",
            description="Detects co-seismic or large rainfall-induced landslide events using Sentinel-1 SAR amplitude changes.",
            input_modalities=["Sentinel-1 GRD"],
            output_type="Event Probability Map",
            resolution="10m",
            geographic_scope="NER",
            trigger_type="Earthquake/Heavy Rainfall",
            validation_region="Earthquake-only validation (Sikkim 2011 simulated)",
            validation_metrics={"f1_score": 0.55},
            known_limitations=["High false positive rate from agriculture/vegetation change", "Requires clear pre/post event pairs"],
            training_data="Curated event-specific SAR pairs",
            compute_requirements="High (GPU/Cloud processing)"
        ))
        
        self.register_model(ModelInfo(
            model_id="landslide4sense_unet",
            name="Optical Segmentation Baseline",
            version="1.0.0",
            status=ModelStatus.VALIDATED,
            license="Research/Academic",
            description="Deep learning baseline for landslide semantic segmentation using multispectral data.",
            input_modalities=["Sentinel-2 Multispectral"],
            output_type="Binary Mask",
            resolution="10m",
            geographic_scope="NER",
            trigger_type="Optical imagery availability",
            validation_region="Landslide4Sense Benchmark Region",
            validation_metrics={"iou": 0.65},
            known_limitations=["Cloud cover dependency", "Struggles with old, revegetated landslides"],
            training_data="Landslide4Sense Dataset",
            compute_requirements="High (GPU, min 16GB VRAM)"
        ))
        
        self.register_model(ModelInfo(
            model_id="terratrack_optical",
            name="Optical Feature Tracking",
            version="0.2.0",
            status=ModelStatus.EXPERIMENTAL,
            license="Proprietary/Internal",
            description="Tracks slow-moving landslides using optical cross-correlation on high-resolution imagery.",
            input_modalities=["PlanetScope / Sentinel-2"],
            output_type="Velocity Vectors",
            resolution="3-10m",
            geographic_scope="Site-specific",
            trigger_type="Continuous",
            validation_region="Darjeeling Hills",
            validation_metrics={"rmse_velocity": 0.8},
            known_limitations=["Requires cloud-free periods", "Only works on bare earth or specific textures"],
            training_data="None (Algorithm based)",
            compute_requirements="Medium (CPU parallel)"
        ))
        
        self.register_model(ModelInfo(
            model_id="mintpy_insar",
            name="InSAR Time Series (MintPy)",
            version="1.0.0",
            status=ModelStatus.PRODUCTION,
            license="Open Source (MintPy)",
            description="Long-term deformation monitoring using SBAS InSAR. Restricted to infrastructure corridors due to vegetation decorrelation.",
            input_modalities=["Sentinel-1 SLC"],
            output_type="Deformation Time Series & Velocity",
            resolution="20m",
            geographic_scope="NER Infrastructure Corridors",
            trigger_type="Continuous",
            validation_region="National Highway Corridors",
            validation_metrics={"velocity_precision_mm_yr": 2.5},
            known_limitations=["Severe decorrelation in dense vegetation", "Atmospheric noise artifacts"],
            training_data="None (Physical processing)",
            compute_requirements="Very High (Cluster/Cloud)"
        ))
        
        self.register_model(ModelInfo(
            model_id="polsar_fveg",
            name="PolSAR Vegetation Fraction (fveg)",
            version="0.1.0",
            status=ModelStatus.RESEARCH,
            license="Proprietary/Internal",
            description="Derives structural vegetation changes (fveg) using Cloude-Pottier decomposition on Quad-pol or Dual-pol SAR. NOT validated for predicting landslides.",
            input_modalities=["ALOS-2 / NISAR (simulated) / Sentinel-1"],
            output_type="fveg Index (0-1)",
            resolution="10m-30m",
            geographic_scope="Targeted test sites",
            trigger_type="None",
            validation_region="Pending",
            validation_metrics={},
            known_limitations=["Unproven correlation with landslide events", "Highly sensitive to moisture"],
            training_data="None",
            compute_requirements="High (Complex math operations)"
        ))
        
        self.register_model(ModelInfo(
            model_id="displacement_forecaster",
            name="Kinematic Displacement Forecaster",
            version="0.4.0",
            status=ModelStatus.EXPERIMENTAL,
            license="Proprietary/Internal",
            description="Site-specific forecasting of time-to-failure based on inverse velocity and acceleration tracking.",
            input_modalities=["InSAR Velocity", "GNSS / Extensometer"],
            output_type="Time to Failure (Days) + Confidence",
            resolution="Point",
            geographic_scope="Site-specific (Monitored slopes only)",
            trigger_type="Threshold Velocity Exceeded",
            validation_region="Synthetic Tests",
            validation_metrics={"ttf_error_margin_days": 5},
            known_limitations=["Assumes specific failure mechanism (tertiary creep)", "Requires high-frequency reliable data"],
            training_data="Historical slope failure time-series",
            compute_requirements="Low"
        ))
        
        self.register_model(ModelInfo(
            model_id="fusion_model",
            name="Multimodal Evidence Fusion Engine",
            version="1.0.0",
            status=ModelStatus.PRODUCTION,
            license="Proprietary/Internal",
            description="Aggregates predictions, uncertainty, and agreement across multiple independent ML models and empirical thresholds.",
            input_modalities=["Susceptibility", "Rainfall Trigger", "LHASA", "InSAR", "Optical"],
            output_type="Unified Hazard Probability + Evidence Quality",
            resolution="Variable",
            geographic_scope="NER",
            trigger_type="Ensemble",
            validation_region="Pan-NER",
            validation_metrics={"roc_auc": 0.88, "calibration_error": 0.05},
            known_limitations=["Degrades gracefully when modalities are missing, but relies heavily on rainfall & susceptibility baseline"],
            training_data="Retrospective multimodal hazard predictions vs actual events",
            compute_requirements="Medium"
        ))

# Singleton instance
registry = ModelRegistry()
