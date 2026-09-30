"""Forecast blender: merges H1 (obs-driven) and H3 (environment-driven).

Weights shift from H1 to H3 with lead time.
Follows the pysteps "blend nowcast into NWP" idea.
Weights are published in the UI.
"""
from __future__ import annotations

import numpy as np


def blend_forecasts(
    h1_forecast: np.ndarray | None,
    h3_favourability: np.ndarray | None,
    lead_min: int,
    blend_start_min: int = 90,
    blend_end_min: int = 180,
) -> tuple[np.ndarray | None, float, float]:
    """Blend H1 and H3 forecasts based on lead time.

    Args:
        h1_forecast: Cell-level forecast (ny, nx).
        h3_favourability: Environment favourability (ny, nx) or None.
        lead_min: Forecast lead time in minutes.
        blend_start_min: Start blending at this lead time.
        blend_end_min: Full H3 weight at this lead time.

    Returns:
        (blended, w_h1, w_h3): blended field and weights.
    """
    if lead_min <= blend_start_min:
        w_h1, w_h3 = 1.0, 0.0
    elif lead_min >= blend_end_min:
        w_h1, w_h3 = 0.0, 1.0
    else:
        t = (lead_min - blend_start_min) / (blend_end_min - blend_start_min)
        w_h1 = 1.0 - t
        w_h3 = t

    if h1_forecast is not None and h3_favourability is not None:
        blended = (w_h1 * h1_forecast + w_h3 * h3_favourability).astype(np.float32)
    elif h1_forecast is not None:
        blended = h1_forecast
        w_h1, w_h3 = 1.0, 0.0
    elif h3_favourability is not None:
        blended = h3_favourability
        w_h1, w_h3 = 0.0, 1.0
    else:
        blended = None

    return blended, w_h1, w_h3
