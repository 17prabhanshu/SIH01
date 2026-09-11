import pytest
import numpy as np
import geopandas as gpd
from shapely.geometry import Point
from ml.susceptibility.model import SusceptibilityModel
from ml.susceptibility.dataset import DataQualityGate, DatasetMetadata
from ml.susceptibility.pipeline import SupervisedPipeline, MLValidationError
from ml.registry.model_registry import registry, ModelStatus
from ml.registry.evaluation import EvaluationFramework

def test_inference_contract_blocks_untrained_model():
    model = SusceptibilityModel()
    
    metadata = {"lat": 27.0, "lon": 88.0, "provenance": "test"}
    features = np.array([[27.0, 88.0, 1000, 10]])
    
    result = model.predict(features, metadata)
    
    assert result["model_status"] == "BLOCKED"
    assert result["probability_status"] == "UNAVAILABLE"
    assert "pending authoritative NER labels" in result["reason"]

def test_inference_contract_blocks_out_of_domain():
    model = SusceptibilityModel()
    model.is_trained = True # Mock training just to test OOD
    
    # Coordinate in USA, not NER
    metadata = {"lat": 38.0, "lon": -120.0, "provenance": "test"}
    features = np.array([[38.0, -120.0, 1000, 10]])
    
    result = model.predict(features, metadata)
    
    assert result["model_status"] == "OUT_OF_DOMAIN"
    assert result["probability_status"] == "UNAVAILABLE"
    assert "outside the NER" in result["reason"]

def test_registry_has_no_fake_metrics():
    model_info = registry.get_model("susceptibility_rf")
    assert model_info.status == ModelStatus.DEVELOPMENT_BENCHMARK
    assert model_info.validation_metrics == {}
    assert model_info.calibration_status == "PLATT SCALING"
    assert model_info.dataset_version == "benchmark_v1"

def test_data_quality_gate_rejects_synthetic():
    metadata = DatasetMetadata(
        dataset_name="Fake Data",
        source="Synthetic Generation Script",
        source_url="",
        acquisition_date="2026-09-11",
        geographic_coverage="NER",
        crs="EPSG:4326",
        spatial_resolution="30m",
        temporal_resolution="static",
        label_definition="synthetic",
        positive_class_definition="1",
        negative_class_definition="0",
        preprocessing_steps=[],
        feature_version="v1.0",
        dataset_version="v0",
        license="",
        limitations=""
    )
    
    gdf = gpd.GeoDataFrame({
        "label": [1, 0, 1],
        "geometry": [Point(88, 27), Point(88, 27.1), Point(88.1, 27)]
    }, crs="EPSG:4326")
    
    result = DataQualityGate.validate(gdf, metadata)
    assert result["status"] == "REJECTED"
    assert any("Synthetic" in issue for issue in result["issues"])

def test_data_quality_gate_rejects_invalid_crs():
    metadata = DatasetMetadata(
        dataset_name="Real Data",
        source="Authoritative Source",
        source_url="",
        acquisition_date="2026-09-11",
        geographic_coverage="NER",
        crs="EPSG:4326",
        spatial_resolution="30m",
        temporal_resolution="static",
        label_definition="landslide",
        positive_class_definition="1",
        negative_class_definition="0",
        preprocessing_steps=[],
        feature_version="v1.0",
        dataset_version="v1",
        license="",
        limitations=""
    )
    
    # EPSG:3857 instead of 4326
    gdf = gpd.GeoDataFrame({
        "label": [1, 0, 1],
        "geometry": [Point(88, 27), Point(88, 27.1), Point(88.1, 27)]
    }, crs="EPSG:3857")
    
    result = DataQualityGate.validate(gdf, metadata)
    assert result["status"] == "REJECTED"
    assert any("Invalid CRS" in issue for issue in result["issues"])

def test_spatial_split_blocks_random():
    pipeline = SupervisedPipeline(None, "")
    
    # Empty geodataframe
    gdf = gpd.GeoDataFrame()
    
    with pytest.raises(MLValidationError) as excinfo:
        pipeline._apply_spatial_split(gdf, "RANDOM")
        
    assert "Random train/test splits are forbidden" in str(excinfo.value)
    
def test_evaluation_framework_blocks_synthetic():
    y_true = np.array([0, 1, 0, 1])
    y_prob = np.array([0.1, 0.9, 0.2, 0.8])
    
    result = EvaluationFramework.evaluate_classification(y_true, y_prob, is_authoritative=False)
    assert result["status"] == "BLOCKED"
    assert result["metrics"] == {}
    
    result = EvaluationFramework.evaluate_classification(y_true, y_prob, is_authoritative=True)
    assert result["status"] == "VALIDATED"
    assert "roc_auc" in result["metrics"]
