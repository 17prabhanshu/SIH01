import ee
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class Sentinel1Adapter:
    """Adapter for processing Sentinel-1 SAR data."""
    
    def __init__(self, region: ee.Geometry):
        self.region = region
        self.collection = ee.ImageCollection('COPERNICUS/S1_GRD')\
            .filterBounds(self.region)\
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))\
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))\
            .filter(ee.Filter.eq('instrumentMode', 'IW'))

    def get_collection(self, start_date: str, end_date: str, orbit_pass: str = 'ASCENDING') -> ee.ImageCollection:
        """Get filtered S1 collection."""
        return self.collection\
            .filterDate(start_date, end_date)\
            .filter(ee.Filter.eq('orbitProperties_pass', orbit_pass))
            
    def compute_change_log_ratio(self, before_img: ee.Image, after_img: ee.Image) -> ee.Image:
        """Compute change detection using log ratio (after / before)."""
        # S1 GRD in GEE is already in dB if selected, or linear.
        # Assuming linear, ratio is a/b. In dB, difference is log ratio.
        # GEE S1 GRD is typically provided in dB.
        return after_img.subtract(before_img) # dB difference = log ratio
