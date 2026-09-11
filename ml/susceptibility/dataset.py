from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any, Optional
import geopandas as gpd

@dataclass
class DatasetMetadata:
    dataset_name: str
    source: str
    source_url: str
    acquisition_date: str
    geographic_coverage: str
    crs: str
    spatial_resolution: str
    temporal_resolution: str
    label_definition: str
    positive_class_definition: str
    negative_class_definition: str
    preprocessing_steps: List[str]
    feature_version: str
    dataset_version: str
    license: str
    limitations: str

class DataQualityGate:
    """
    Quality gate ensuring authoritative NER datasets are valid, 
    preventing synthetic or leaked datasets from entering training.
    """
    
    EXPECTED_CRS = "EPSG:4326"

    @staticmethod
    def validate(gdf: gpd.GeoDataFrame, metadata: DatasetMetadata) -> Dict[str, Any]:
        """
        Validate the dataset against strict scientific constraints.
        Returns a dictionary with status and reason.
        """
        issues = []
        
        # 1. CRS Validation
        if not gdf.crs:
            issues.append("Missing CRS.")
        elif str(gdf.crs) != DataQualityGate.EXPECTED_CRS:
            issues.append(f"Invalid CRS. Expected {DataQualityGate.EXPECTED_CRS}, got {gdf.crs}.")

        # 2. Geometry Validity
        invalid_geoms = gdf[~gdf.geometry.is_valid]
        if len(invalid_geoms) > 0:
            issues.append(f"Dataset contains {len(invalid_geoms)} invalid geometries.")

        # 3. Label Balance
        if 'label' not in gdf.columns:
            issues.append("Missing 'label' column.")
        else:
            pos_count = len(gdf[gdf['label'] == 1])
            neg_count = len(gdf[gdf['label'] == 0])
            
            if pos_count == 0 or neg_count == 0:
                issues.append("Severe label imbalance: missing positive or negative class.")
                
            total = len(gdf)
            if pos_count / total < 0.05 or neg_count / total < 0.05:
                issues.append("Label imbalance: minority class is less than 5% of data.")

        # 4. Duplicates
        if gdf.geometry.duplicated().any():
            issues.append("Dataset contains duplicated geometries.")

        # 5. Provenance Check
        if not metadata.source or "synthetic" in metadata.source.lower():
            issues.append("Synthetic or missing data source. Only authoritative data is allowed.")

        if issues:
            return {
                "status": "REJECTED",
                "reason": "Dataset failed quality gate.",
                "issues": issues
            }

        return {
            "status": "PASSED",
            "reason": "Dataset meets authoritative readiness requirements.",
            "issues": []
        }
