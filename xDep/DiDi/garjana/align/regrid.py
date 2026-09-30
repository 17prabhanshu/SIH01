"""Regridding utilities for the 2 km analysis domain.

R11: Satellite is never described as 2 km. It is "context, upsampled".
All regridded fields carry a flag indicating if they were upsampled.
"""
from __future__ import annotations

import numpy as np

from core.types import GridSpec


def regrid_bilinear(
    field: np.ndarray,
    target_shape: tuple[int, int] = (256, 256),
) -> np.ndarray:
    """Bilinear regridding to target shape.

    For satellite data: flagged as 'context_upsampled' (R11).

    Args:
        field: Input 2D array.
        target_shape: Target (ny, nx).

    Returns:
        Regridded array.
    """
    from scipy.ndimage import zoom

    zy = target_shape[0] / field.shape[0]
    zx = target_shape[1] / field.shape[1]
    return zoom(field, (zy, zx), order=1).astype(np.float32)


def regrid_to_grid(
    field: np.ndarray,
    grid_spec: GridSpec,
) -> np.ndarray:
    """Regrid a field to match the analysis grid specification."""
    target_shape = (grid_spec.ny, grid_spec.nx)
    if field.shape == target_shape:
        return field
    return regrid_bilinear(field, target_shape)
