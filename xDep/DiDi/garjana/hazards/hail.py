"""Hail hazard assessment.

Physics proxies: VIL density, height of high-dBZ core above freezing level.
R4: ALWAYS tier=experimental. No wind speed output.
"""
from __future__ import annotations

import numpy as np

from core.config import Config
from core.types import HazardValue, ValidationTier


def compute_hail_hazard(
    vil: float,
    echo_top_km: float | None = None,
    freezing_level_km: float | None = None,
    max_dbz: float = 0.0,
    lead_min: int = 30,
    storm_id: str | None = None,
    oi_summary: float = 0.5,
) -> HazardValue:
    """Compute hail-favourable probability from physics proxies.

    R4: Always experimental. Output is "hail-favourable core", not hail prediction.
    """
    try:
        cfg = Config.get("thresholds")
        hail_cfg = cfg.get("hazard_thresholds", {}).get("hail", {})
        vil_density_thresh = hail_cfg.get("vil_density_kg_m3", 3.5)
        dbz_above_freezing_km = hail_cfg.get("dbz_above_freezing_min_km", 2.0)
    except FileNotFoundError:
        vil_density_thresh = 3.5
        dbz_above_freezing_km = 2.0

    prob = 0.0

    # VIL density proxy
    if vil > 0 and echo_top_km is not None and echo_top_km > 0:
        vil_density = vil / echo_top_km
        if vil_density >= vil_density_thresh:
            prob += 0.4

    # High-dBZ core above freezing
    if (echo_top_km is not None and freezing_level_km is not None
            and echo_top_km - freezing_level_km >= dbz_above_freezing_km):
        prob += 0.3

    # Strong reflectivity
    if max_dbz >= 55:
        prob += 0.2
    elif max_dbz >= 50:
        prob += 0.1

    prob = float(np.clip(prob, 0.0, 1.0))

    return HazardValue(
        hazard="hail",
        value=round(prob, 3),
        unit="probability",
        validation_tier=ValidationTier.EXPERIMENTAL,  # R4: ALWAYS experimental
        method_version="v1.0_physics_proxy",
        oi_summary=oi_summary,
        lead_min=lead_min,
        storm_id=storm_id,
    )
