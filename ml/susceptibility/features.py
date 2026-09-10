import numpy as np
from typing import Dict, Any, Tuple

class TerrainFeatureExtractor:
    """Extracts geomorphological features from Digital Elevation Models (DEM)."""
    
    def __init__(self, resolution_m: float = 30.0):
        self.resolution_m = resolution_m

    def extract_features(self, dem_array: np.ndarray) -> Dict[str, np.ndarray]:
        """
        Extract terrain features using standard numpy gradients.
        
        Args:
            dem_array: 2D numpy array containing elevation values.
            
        Returns:
            Dictionary of derived 2D feature arrays.
        """
        # Handling missing/no-data natively with masked arrays or NaNs
        dem = np.where(dem_array == -9999, np.nan, dem_array)
        
        dy, dx = np.gradient(dem, self.resolution_m, self.resolution_m)
        slope = np.arctan(np.sqrt(dx**2 + dy**2))
        aspect = np.arctan2(dy, -dx)
        
        # Second derivatives for curvature
        dyy, dyx = np.gradient(dy, self.resolution_m, self.resolution_m)
        dxy, dxx = np.gradient(dx, self.resolution_m, self.resolution_m)
        
        # Simplified curvature approximations
        profile_curvature = (dx**2 * dxx + 2*dx*dy*dxy + dy**2 * dyy) / (dx**2 + dy**2 + 1e-6)
        plan_curvature = (dx**2 * dyy - 2*dx*dy*dxy + dy**2 * dxx) / (dx**2 + dy**2 + 1e-6)
        
        # Topographic Position Index (TPI) - Mock window operation
        tpi = self._compute_tpi(dem)
        
        # Mock implementations for hydrological features which require D8 routing algorithms
        twi = slope * 0.5 + 5.0 # Mock fallback, replace with pysheds/whitebox in prod
        spi = slope * 2.0       # Mock fallback
        
        return {
            "elevation": dem,
            "slope": np.degrees(slope),
            "aspect": np.degrees(aspect),
            "profile_curvature": profile_curvature,
            "plan_curvature": plan_curvature,
            "tpi": tpi,
            "twi": twi,
            "spi": spi,
            "terrain_roughness": np.std(dem) * np.ones_like(dem),  # Simplified
            # Stream distance and relief are normally calculated using external DEM ops
        }

    def _compute_tpi(self, dem: np.ndarray, window_size: int = 5) -> np.ndarray:
        """Computes Topographic Position Index using a naive mean filter subtraction."""
        from scipy.ndimage import uniform_filter
        mean_dem = uniform_filter(dem, size=window_size)
        return dem - mean_dem


class GeologyFeatureExtractor:
    """Extracts and encodes geological features."""
    
    def __init__(self, lithology_map: Dict[str, int]):
        self.lithology_map = lithology_map
        
    def encode_lithology(self, lithology_grid: np.ndarray) -> np.ndarray:
        """Applies lithology mapping."""
        # Replace mapping strings with int IDs
        encoded = np.copy(lithology_grid)
        return encoded

    def compute_fault_distance(self, distance_grid: np.ndarray) -> np.ndarray:
        """Process proximity to geological faults."""
        return np.exp(-distance_grid / 500.0) # Decay function


class HistoricalFeatureExtractor:
    """Extracts features related to past landslide occurrences."""
    
    def compute_landslide_density(self, events: np.ndarray, radius_km: float = 5.0) -> np.ndarray:
        """
        Computes historical density of landslides.
        events: binary grid where 1 = past landslide
        """
        from scipy.ndimage import gaussian_filter
        # Use a Gaussian filter as a proxy for density in a radius
        sigma = (radius_km * 1000) / 30.0 # Assuming 30m resolution
        return gaussian_filter(events.astype(float), sigma=sigma)


class LandCoverFeatureExtractor:
    """Extracts Land Use/Land Cover features."""
    
    def encode_lulc(self, lulc_grid: np.ndarray) -> np.ndarray:
        """Categorical encoding of LULC classes."""
        return lulc_grid
        
    def extract_ndvi_trend(self, ndvi_timeseries: np.ndarray) -> np.ndarray:
        """
        Computes trend in NDVI to detect vegetation loss.
        ndvi_timeseries: 3D array (time, y, x)
        """
        if len(ndvi_timeseries.shape) < 3:
            raise ValueError("NDVI timeseries must be 3-dimensional")
        
        # Simple linear slope across time axis
        time_steps = np.arange(ndvi_timeseries.shape[0])
        # Calculate covariance / variance to find slope
        mean_t = np.mean(time_steps)
        mean_ndvi = np.mean(ndvi_timeseries, axis=0)
        
        cov = np.sum((time_steps[:, None, None] - mean_t) * (ndvi_timeseries - mean_ndvi), axis=0)
        var = np.sum((time_steps - mean_t)**2)
        
        return cov / var

def normalize_features(features: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
    """Standardize features and handle NaNs."""
    normalized = {}
    for name, data in features.items():
        if data.dtype.kind in 'fc':  # Float or complex
            # Fill NaNs with median
            mask = np.isnan(data)
            valid_data = data[~mask]
            
            if len(valid_data) > 0:
                median_val = np.median(valid_data)
                filled = np.where(mask, median_val, data)
                
                # Z-score normalize
                mean_val = np.mean(filled)
                std_val = np.std(filled) + 1e-8
                normalized[name] = (filled - mean_val) / std_val
            else:
                normalized[name] = np.zeros_like(data)
        else:
            normalized[name] = data
            
    return normalized
