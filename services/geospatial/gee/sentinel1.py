import ee
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class Sentinel1Adapter:
    """Adapter for processing real Sentinel-1 SAR data via Google Earth Engine."""
    
    def __init__(self, project_id: str = "pure-wall-462105-q9"):
        try:
            # Re-initialize to ensure context is active
            ee.Initialize(project=project_id)
        except Exception as e:
            logger.error(f"GEE Initialization failed: {e}")
            raise

    def get_sar_change_metric(self, lat: float, lon: float, pre_start: str, pre_end: str, post_start: str, post_end: str, radius_m: float = 1000) -> Dict[str, Any]:
        """
        Computes a genuine pre/post SAR amplitude change metric (log ratio) for a given coordinate.
        Returns a structured provenance and status object.
        """
        try:
            aoi = ee.Geometry.Point([lon, lat]).buffer(radius_m)
            
            # 1. Acquire Baseline (Pre-event)
            pre_collection = ee.ImageCollection('COPERNICUS/S1_GRD') \
                .filterBounds(aoi) \
                .filterDate(pre_start, pre_end) \
                .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV')) \
                .filter(ee.Filter.eq('instrumentMode', 'IW')) \
                .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
                
            pre_count = pre_collection.size().getInfo()
            
            # 2. Acquire Comparison (Post-event)
            post_collection = ee.ImageCollection('COPERNICUS/S1_GRD') \
                .filterBounds(aoi) \
                .filterDate(post_start, post_end) \
                .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV')) \
                .filter(ee.Filter.eq('instrumentMode', 'IW')) \
                .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
                
            post_count = post_collection.size().getInfo()
            
            if pre_count == 0 or post_count == 0:
                return {
                    "source": "Google Earth Engine",
                    "collection": "COPERNICUS/S1_GRD",
                    "status": "TEMPORAL_DATA_UNAVAILABLE",
                    "value": None,
                    "provenance": {
                        "root_cause": f"Insufficient scenes. Pre: {pre_count}, Post: {post_count}",
                        "aoi_radius": radius_m
                    }
                }

            # 3. Compute Real Feature: Log Ratio (Difference of dB)
            pre_img = pre_collection.select('VV').mean()
            post_img = post_collection.select('VV').mean()
            
            # S1 GRD in GEE is provided in decibels (dB) by default. 
            # The difference between two dB values is mathematically equivalent to the log ratio of their linear powers.
            # A negative drop in backscatter (e.g., surface smoothing from landslide scarp/water) is a common heuristic.
            log_ratio = post_img.subtract(pre_img)
            
            # 4. Extract scalar metric for the AOI
            stats = log_ratio.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=aoi,
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            mean_change_db = stats.get('VV', 0.0)
            
            # Fetch metadata for provenance
            pre_info = pre_collection.first().getInfo()
            post_info = post_collection.first().getInfo()
            
            return {
                "source": "Google Earth Engine",
                "collection": "COPERNICUS/S1_GRD",
                "status": "HISTORICAL",
                "value": mean_change_db,
                "value_semantics": "Mean VV backscatter change (dB)",
                "acquisition_time_pre": pre_info['properties'].get('system:time_start'),
                "acquisition_time_post": post_info['properties'].get('system:time_start'),
                "orbit": "DESCENDING",
                "polarization": "VV",
                "spatial_resolution": "10m",
                "provenance": {
                    "baseline_scenes": pre_count,
                    "comparison_scenes": post_count,
                    "metric": "Log Ratio (dB difference)",
                    "pre_id": pre_info.get('id'),
                    "post_id": post_info.get('id')
                }
            }
            
        except Exception as e:
            logger.error(f"GEE processing failed: {e}")
            return {
                "source": "Google Earth Engine",
                "collection": "COPERNICUS/S1_GRD",
                "status": "INFERENCE_FAILURE",
                "value": None,
                "provenance": {
                    "root_cause": str(e)
                }
            }
