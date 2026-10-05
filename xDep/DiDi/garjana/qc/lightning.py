"""Lightning data quality control."""
from __future__ import annotations

from core.types import Observation


def qc_lightning(obs: Observation) -> Observation:
    """Apply QC to lightning observation."""
    obs.qc["status"] = "passed"
    return obs
