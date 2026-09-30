"""Extreme rain-rate risk ("cloudburst-type") hazard.

R4: EXPERIMENTAL tier only. Never output "cloudburst forecast".
Observed cloudburst is a separate post-event label.
"""
from __future__ import annotations

import numpy as np

from core.config import Config
from core.types import HazardValue, ValidationTier
from hazards.rain import reflectivity_to_rain_rate


def compute_extreme_rain_risk(
    reflectivity_ensemble: list[np.ndarray],
    orography_factor: float = 1.0,
    oi_summary: float = 0.5,
    lead_min: int = 30,
    storm_id: str | None = None,
) -> HazardValue:
    """Compute extreme rain-rate risk.

    P(R >= 100 mm/h over >= 20-30 km^2) from ensemble,
    gated by orography and radar OI.

    R4: Always tier=experimental. Never say "cloudburst forecast".
    """
    try:
        cfg = Config.get("thresholds")
        er_cfg = cfg.get("hazard_thresholds", {}).get("extreme_rain_rate", {})
        rate_thresh = er_cfg.get("rate_mm_per_hour", 100.0)
        area_thresh_km2 = er_cfg.get("min_area_km2", 20.0)
    except FileNotFoundError:
        rate_thresh = 100.0
        area_thresh_km2 = 20.0

    n_exceed = 0
    cell_area_km2 = 4.0  # 2 km grid cells
    min_pixels = int(area_thresh_km2 / cell_area_km2)

    for member in reflectivity_ensemble:
        rain_rate = reflectivity_to_rain_rate(member)
        extreme_pixels = (rain_rate >= rate_thresh).sum()
        if extreme_pixels >= min_pixels:
            n_exceed += 1

    prob = n_exceed / len(reflectivity_ensemble) if len(reflectivity_ensemble) > 0 else 0.0
    prob *= orography_factor
    prob = float(np.clip(prob, 0.0, 1.0))

    return HazardValue(
        hazard="extreme_rain",
        value=round(prob, 3),
        unit="probability",
        validation_tier=ValidationTier.EXPERIMENTAL,  # R4: ALWAYS experimental
        method_version="v1.0_ensemble_orography",
        oi_summary=oi_summary,
        lead_min=lead_min,
        storm_id=storm_id,
    )
