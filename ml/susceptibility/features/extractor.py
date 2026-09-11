import abc
from typing import Dict, Any, List
from pydantic import BaseModel
from datetime import datetime

class FeatureProvenance(BaseModel):
    source: str
    spatial_resolution: str
    temporal_resolution: str
    acquisition_date: str
    preprocessing: List[str]
    missing_data_treatment: str

class ExtractedFeature(BaseModel):
    name: str
    value: float
    provenance: FeatureProvenance

class FeatureExtractor(abc.ABC):
    """Abstract interface for feature extractors."""
    
    @abc.abstractmethod
    def extract(self, lat: float, lon: float, date: datetime = None) -> ExtractedFeature:
        """Extract a single feature for a given location and optional date."""
        pass

class TerrainFeatureExtractor(FeatureExtractor):
    """Extracts DEM, slope, aspect, curvature, TWI, SPI."""
    def __init__(self, dem_path: str):
        self.dem_path = dem_path
        
    def extract(self, lat: float, lon: float, date: datetime = None) -> ExtractedFeature:
        # TODO: Implement real rasterio read and calculation
        raise NotImplementedError("Real raster extraction must be implemented here. Fake data prohibited.")

class RainfallFeatureExtractor(FeatureExtractor):
    """Extracts antecedent rainfall strictly observing temporal leakage constraints."""
    def __init__(self, rainfall_source: str):
        self.rainfall_source = rainfall_source
        
    def extract(self, lat: float, lon: float, date: datetime) -> ExtractedFeature:
        # TODO: Implement time-aware historical rainfall lookup
        # Must ensure data used is STRICTLY prior to 'date'
        raise NotImplementedError("Real rainfall historical lookup must be implemented here. Fake data prohibited.")
