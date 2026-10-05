"""Damaging wind / downburst hazard assessment.

Environmental DCAPE + reflectivity-core descent + Doppler velocity.
R4: ALWAYS experimental/environment_only.
NEVER output a wind speed number unless calibrated.
"""
from __future__ import annotations

import numpy as np

from core.config import Config
from core.types import HazardValue, ValidationTier


def compute_wind_hazard(
    dcape: float = 0.0,
    max_dbz: float = 0.0,
    reflectivity_descent: bool = False,
    has_doppler: bool = False,
    lead_min: int = 30,
    storm_id: str | None = None,
    oi_summary: float = 0.5,
) -> HazardValue:
    """Compute damaging-wind risk.

    R4: ALWAYS experimental or environment_only.
    R4: NEVER output a wind speed number. Say "damaging-wind risk".
    """
    try:
        cfg = Config.get("thresholds")
        wind_cfg = cfg.get("hazard_thresholds", {}).get("wind", {})
        dcape_thresh = wind_cfg.get("dcape_threshold_j_kg", 800.0)
    except FileNotFoundError:
        dcape_thresh = 800.0

    prob = 0.0

    # DCAPE contribution
    if dcape >= dcape_thresh:
        prob += np.clip((dcape - dcape_thresh) / 1000.0, 0.0, 0.4)

    # Reflectivity core descent
    if reflectivity_descent and max_dbz >= 45:
        prob += 0.2

    # Strong reflectivity
    if max_dbz >= 55:
        prob += 0.1

    prob = float(np.clip(prob, 0.0, 1.0))

    # Tier depends on whether we have DCAPE only (env) or also radar signatures
    tier = (
        ValidationTier.EXPERIMENTAL
        if reflectivity_descent or max_dbz >= 40
        else ValidationTier.ENVIRONMENT_ONLY
    )

    return HazardValue(
        hazard="wind",
        value=round(prob, 3),
        unit="probability",
        validation_tier=tier,
        method_version="v1.0_dcape_descent",
        oi_summary=oi_summary,
        lead_min=lead_min,
        storm_id=storm_id,
    )
