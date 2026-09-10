import ee
from typing import Dict, Any

class DEMProcessor:
    """DEM processing for terrain features."""
    
    def __init__(self, region: ee.Geometry):
        self.region = region
        # Use SRTM 30m by default
        self.dem = ee.Image("USGS/SRTMGL1_003").clip(self.region)
        
    def get_elevation(self) -> ee.Image:
        return self.dem

    def get_slope(self) -> ee.Image:
        """Compute slope in degrees."""
        return ee.Terrain.slope(self.dem)
        
    def get_aspect(self) -> ee.Image:
        """Compute aspect."""
        return ee.Terrain.aspect(self.dem)
        
    def get_terrain_products(self) -> ee.Image:
        """Compute all terrain features (slope, aspect) and combine."""
        products = ee.Terrain.products(self.dem)
        return products
        
    def get_twi(self) -> ee.Image:
        """Compute Topographic Wetness Index (TWI)."""
        # Simplified TWI approximation for GEE
        slope = self.get_slope().multiply(math.pi / 180.0) # radians
        # Note: True TWI needs flow accumulation which is complex in standard GEE
        # This is a placeholder for actual server-side TWI logic
        return slope # Placeholder
