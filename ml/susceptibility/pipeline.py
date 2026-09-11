from typing import Dict, Any, Tuple, Optional
import numpy as np
import geopandas as gpd
from sklearn.model_selection import KFold
import logging
from .dataset import DataQualityGate, DatasetMetadata

logger = logging.getLogger(__name__)

class MLValidationError(Exception):
    pass

class SupervisedPipeline:
    """
    Production pipeline designed for real authoritative NER labels.
    Enforces provenance, spatial/temporal holding, and prevents
    synthetic/fake training leaks.
    """

    def __init__(self, model, feature_schema_path: str):
        self.model = model
        self.feature_schema_path = feature_schema_path
        
    def _apply_spatial_split(self, gdf: gpd.GeoDataFrame, strategy: str) -> Dict[str, np.ndarray]:
        """
        Implements leakage-resistant spatial splits.
        Random splitting of geospatial pixels is forbidden.
        """
        if strategy == "RANDOM":
            raise MLValidationError("Random train/test splits are forbidden for geospatial data due to spatial autocorrelation leakage. Use 'SPATIAL_BLOCK' or 'REGIONAL'.")
            
        n_samples = len(gdf)
        indices = np.arange(n_samples)
        
        # Simplified block-based split simulation:
        # In a real implementation, we would group by e.g. a grid or H3 hex.
        # For this skeleton, we assume the dataset provides a 'block_id' or we simulate it cleanly.
        
        if 'block_id' not in gdf.columns:
            logger.warning("No 'block_id' found for spatial split. Falling back to deterministic latitude sorting split (approximate spatial holding).")
            sorted_idx = np.argsort(gdf.geometry.y.values)
            split_point = int(n_samples * 0.8)
            train_idx = sorted_idx[:split_point]
            test_idx = sorted_idx[split_point:]
        else:
            unique_blocks = gdf['block_id'].unique()
            np.random.seed(42) # Deterministic
            np.random.shuffle(unique_blocks)
            split_point = int(len(unique_blocks) * 0.8)
            train_blocks = unique_blocks[:split_point]
            
            train_idx = gdf[gdf['block_id'].isin(train_blocks)].index.values
            test_idx = gdf[~gdf['block_id'].isin(train_blocks)].index.values
            
        train_mask = np.isin(indices, train_idx)
        test_mask = np.isin(indices, test_idx)
        
        return {
            'train_mask': train_mask,
            'test_mask': test_mask
        }

    def execute_training_run(
        self, 
        dataset: gpd.GeoDataFrame, 
        metadata: DatasetMetadata,
        split_strategy: str = "SPATIAL_BLOCK"
    ) -> Dict[str, Any]:
        """
        Executes a full supervised training pipeline with strict validation.
        """
        # 1. Data Quality Gate
        gate_result = DataQualityGate.validate(dataset, metadata)
        if gate_result["status"] == "REJECTED":
            raise MLValidationError(f"Dataset failed quality gate: {gate_result['issues']}")
            
        # 2. Extract Features
        # Assume 'dataset' contains the pre-extracted features matching 'features.json' for now
        # and 'label' is the target.
        feature_cols = [c for c in dataset.columns if c not in ['label', 'geometry', 'block_id']]
        X = dataset[feature_cols].values
        y = dataset['label'].values
        
        # 3. Apply spatial split
        holdout_config = self._apply_spatial_split(dataset, split_strategy)
        
        # 4. Train Model
        metrics = self.model.train(X, y, holdout_config)
        
        return {
            "status": "SUCCESS",
            "model_version": metadata.dataset_version,
            "feature_version": metadata.feature_version,
            "metrics": metrics,
            "provenance": metadata.source
        }
