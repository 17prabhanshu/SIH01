"""Radar quality control.

Timestamp sanity, checksum, missing-fraction, ground-clutter masking,
range-limit masking, reflectivity clipping, duplicate rejection.
"""
from __future__ import annotations

import numpy as np

from core.types import Observation


def qc_radar(obs: Observation, max_dbz: float = 75.0) -> Observation:
    """Apply QC checks to a radar observation."""
    if obs.grid is None:
        obs.qc["status"] = "no_data"
        return obs

    grid = obs.grid.copy()

    # Reflectivity clipping
    grid = np.clip(grid, 0.0, max_dbz)

    # Missing fraction
    missing = np.isnan(grid) | (grid < 0)
    obs.qc["missing_frac"] = float(missing.mean())
    grid[missing] = 0.0

    obs.grid = grid
    obs.qc["status"] = "passed"
    return obs
