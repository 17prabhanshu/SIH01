"""Extrapolation baseline using semi-Lagrangian advection.

R7: Always compute baselines. If ML fails, serve the baseline.
This is the physics backbone that the residual model corrects.
"""
from __future__ import annotations

import numpy as np


def extrapolate_semi_lagrangian(
    field: np.ndarray,
    motion: np.ndarray,
    n_steps: int = 12,
) -> np.ndarray:
    """Semi-Lagrangian extrapolation of a 2D field.

    Args:
        field: Input field (ny, nx), e.g. radar reflectivity.
        motion: Motion field (2, ny, nx) in pixels/timestep.
        n_steps: Number of forecast steps.

    Returns:
        Forecast array of shape (n_steps, ny, nx).
    """
    try:
        from pysteps.extrapolation.semilagrangian import extrapolate as sl_extrapolate
    except ImportError:
        # Fallback: simple advection without pysteps
        return _simple_advection(field, motion, n_steps)

    forecasts = sl_extrapolate(field, motion, n_steps)
    return forecasts


def persistence_forecast(
    field: np.ndarray,
    n_steps: int = 12,
) -> np.ndarray:
    """Persistence baseline: repeat the last observed frame.

    R7: This is the simplest baseline, always computed.

    Args:
        field: Input field (ny, nx).
        n_steps: Number of forecast steps.

    Returns:
        Forecast array of shape (n_steps, ny, nx) — copies of input.
    """
    return np.stack([field.copy() for _ in range(n_steps)], axis=0)


def _simple_advection(
    field: np.ndarray,
    motion: np.ndarray,
    n_steps: int,
) -> np.ndarray:
    """Simple advection fallback when pysteps is not available."""
    from scipy.ndimage import map_coordinates

    ny, nx = field.shape
    forecasts = np.zeros((n_steps, ny, nx), dtype=field.dtype)

    yy, xx = np.mgrid[0:ny, 0:nx].astype(np.float32)
    field.copy()

    for step in range(n_steps):
        # Backtrack coordinates
        src_y = yy - motion[1] * (step + 1)
        src_x = xx - motion[0] * (step + 1)

        # Bilinear interpolation
        forecasts[step] = map_coordinates(
            field, [src_y, src_x], order=1, mode='constant', cval=0.0
        )

    return forecasts
