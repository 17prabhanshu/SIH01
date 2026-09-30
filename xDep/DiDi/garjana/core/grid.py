"""Grid definition and regridding for the 2 km analysis domain.

Each radar domain is 256x256 cells at 2 km on a local azimuthal-equidistant
projection centred on the radar (architecture §3.3).
"""
from __future__ import annotations

import numpy as np
from pyproj import CRS, Transformer

from core.types import GridSpec


def make_grid_coords(spec: GridSpec) -> tuple[np.ndarray, np.ndarray]:
    """Create 2D lat/lon coordinate arrays for the grid.

    Returns:
        (lats, lons): each shape (ny, nx)
    """
    crs = CRS.from_proj4(
        f"+proj={spec.projection} +lat_0={spec.center_lat} "
        f"+lon_0={spec.center_lon} +datum=WGS84"
    )
    transformer = Transformer.from_crs(crs, CRS.from_epsg(4326), always_xy=True)

    x_centers = (np.arange(spec.nx) - spec.nx / 2 + 0.5) * spec.dx_m
    y_centers = (np.arange(spec.ny) - spec.ny / 2 + 0.5) * spec.dy_m
    xx, yy = np.meshgrid(x_centers, y_centers)

    lons, lats = transformer.transform(xx, yy)
    return lats.astype(np.float32), lons.astype(np.float32)


def grid_extent_km(spec: GridSpec) -> float:
    """Return the approximate extent of the grid in km."""
    return spec.nx * spec.dx_m / 1000.0
