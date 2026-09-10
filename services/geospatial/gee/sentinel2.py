import ee
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class Sentinel2Adapter:
    """Adapter for processing Sentinel-2 Optical data."""
    
    def __init__(self, region: ee.Geometry):
        self.region = region
        self.collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')\
            .filterBounds(self.region)

    def mask_clouds(self, image: ee.Image) -> ee.Image:
        """Mask clouds using QA60 band."""
        qa = image.select('QA60')
        cloudBitMask = 1 << 10
        cirrusBitMask = 1 << 11
        mask = qa.bitwiseAnd(cloudBitMask).eq(0)\
            .And(qa.bitwiseAnd(cirrusBitMask).eq(0))
        return image.updateMask(mask)

    def get_median_composite(self, start_date: str, end_date: str, max_cloud_cover: int = 20) -> ee.Image:
        """Get cloud-free median composite."""
        col = self.collection\
            .filterDate(start_date, end_date)\
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', max_cloud_cover))\
            .map(self.mask_clouds)
        return col.median().clip(self.region)
        
    def compute_ndvi(self, image: ee.Image) -> ee.Image:
        """Compute Normalized Difference Vegetation Index."""
        return image.normalizedDifference(['B8', 'B4']).rename('NDVI')
