"""Beam blockage computation from DEM.

Used in Observability Index computation.
"""
from __future__ import annotations

import numpy as np

from core.types import GridSpec


def compute_beam_blockage(
    dem: np.ndarray | None,
    grid_spec: GridSpec,
    radar_height_m: float = 30.0,
    beam_elevation_deg: float = 0.5,
) -> np.ndarray:
    """Compute partial beam blockage fraction from DEM.

    Returns array of shape (ny, nx) with blockage fraction in [0, 1].
    """
    ny, nx = grid_spec.ny, grid_spec.nx

    if dem is None:
        return np.zeros((ny, nx), dtype=np.float32)

    # Simplified: use DEM height relative to radar beam height
    center_y, center_x = ny / 2, nx / 2
    yy, xx = np.mgrid[0:ny, 0:nx]
    distance_pixels = np.sqrt((xx - center_x) ** 2 + (yy - center_y) ** 2)
    distance_m = distance_pixels * grid_spec.dx_m

    # Beam height at distance (simplified, ignoring Earth curvature)
    beam_height = radar_height_m + distance_m * np.tan(np.radians(beam_elevation_deg))

    # Blockage where terrain exceeds beam height
    blockage = np.clip((dem - beam_height) / 500.0, 0.0, 1.0)

    return blockage.astype(np.float32)
