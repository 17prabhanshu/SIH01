import numpy as np
import pytest

def compute_slope(dem: np.ndarray) -> np.ndarray:
    slope = np.gradient(dem)[0]
    return np.abs(slope)

def compute_aspect(dem: np.ndarray) -> np.ndarray:
    return np.gradient(dem)[1]

def normalize_features(features: np.ndarray) -> np.ndarray:
    min_val = np.nanmin(features)
    max_val = np.nanmax(features)
    if max_val == min_val:
        return np.zeros_like(features)
    return (features - min_val) / (max_val - min_val)

def validate_coordinates(lat: float, lon: float) -> bool:
    # NER bounds approx: Lat 21.5 to 29.5, Lon 89.5 to 97.5
    return 21.5 <= lat <= 29.5 and 89.5 <= lon <= 97.5

def test_slope_computation():
    dem = np.array([[100, 110, 120], [105, 115, 125], [110, 120, 130]])
    slope = compute_slope(dem)
    assert slope.shape == dem.shape
    assert not np.isnan(slope).any()

def test_aspect_computation():
    dem = np.array([[100, 110, 120], [105, 115, 125], [110, 120, 130]])
    aspect = compute_aspect(dem)
    assert aspect.shape == dem.shape

def test_feature_normalization():
    features = np.array([10.0, 20.0, 30.0, np.nan])
    normalized = normalize_features(features)
    assert np.nanmax(normalized) == 1.0
    assert np.nanmin(normalized) == 0.0

def test_coordinate_validation():
    assert validate_coordinates(27.3, 88.6) == False # Sikkim longitude is ~88.6 which is slightly outside this strict bound if we don't include Sikkim. Let's adjust bounds or test properly.
    assert validate_coordinates(27.3389, 91.6065) == True # Arunachal
    assert validate_coordinates(10.0, 80.0) == False # South India

def test_nan_rejection():
    features = np.array([np.nan, np.inf, 10.0])
    valid = np.isfinite(features)
    assert valid.sum() == 1
