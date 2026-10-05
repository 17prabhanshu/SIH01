"""Satellite quality control."""
from __future__ import annotations

import numpy as np

from core.types import Observation


def qc_satellite(obs: Observation) -> Observation:
    """Apply QC to satellite observation."""
    if obs.grid is None:
        obs.qc["status"] = "no_data"
        return obs

    missing = np.isnan(obs.grid)
    obs.qc["missing_frac"] = float(missing.mean())
    obs.qc["status"] = "passed"
    return obs
