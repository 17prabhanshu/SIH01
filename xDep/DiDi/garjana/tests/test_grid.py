"""Tests for grid utilities."""
import numpy as np
import pytest

from core.grid import grid_extent_km, make_grid_coords
from core.types import GridSpec


def test_grid_shape():
    spec = GridSpec(center_lat=26.76, center_lon=80.89)
    lats, lons = make_grid_coords(spec)
    assert lats.shape == (256, 256)
    assert lons.shape == (256, 256)


def test_grid_center():
    spec = GridSpec(center_lat=26.76, center_lon=80.89)
    lats, lons = make_grid_coords(spec)
    center_lat = lats[128, 128]
    center_lon = lons[128, 128]
    assert abs(center_lat - 26.76) < 0.1
    assert abs(center_lon - 80.89) < 0.1


def test_grid_extent():
    spec = GridSpec(center_lat=26.76, center_lon=80.89)
    extent = grid_extent_km(spec)
    assert extent == pytest.approx(512.0)


def test_grid_dtype():
    spec = GridSpec(center_lat=0.0, center_lon=0.0)
    lats, lons = make_grid_coords(spec)
    assert lats.dtype == np.float32
    assert lons.dtype == np.float32
