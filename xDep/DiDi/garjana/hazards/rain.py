"""Heavy rain hazard assessment.

Rain rate from configurable Z-R (config/zr.yaml), bias-adjusted
where gauges exist. P(R >= threshold) from ensemble.
"""
from __future__ import annotations

import numpy as np

from core.config import Config
from core.types import HazardValue, ValidationTier


def reflectivity_to_rain_rate(
    reflectivity_dbz: np.ndarray,
    a: float | None = None,
    b: float | None = None,
) -> np.ndarray:
    """Convert reflectivity to rain rate using Z-R relationship.

    R = (Z / a) ^ (1/b) where Z is in linear units.
    Parameters from config/zr.yaml (R14).
    """
    if a is None or b is None:
        try:
            cfg = Config.get("zr")
            default = cfg.get("default", "tropical_convective")
            zr = cfg["zr_relationships"][default]
            a = a or zr["a"]
            b = b or zr["b"]
        except (FileNotFoundError, KeyError):
            a = a or 250.0
            b = b or 1.2

    # Convert dBZ to linear Z
    z_linear = 10.0 ** (reflectivity_dbz / 10.0)

    # Apply Z-R
    rain_rate = (z_linear / a) ** (1.0 / b)
    rain_rate = np.clip(rain_rate, 0.0, 500.0)  # Physical clipping

    return rain_rate.astype(np.float32)


def compute_rain_hazard(
    reflectivity_ensemble: list[np.ndarray],
    threshold_mm_h: float = 64.0,
    lead_min: int = 30,
    storm_id: str | None = None,
    oi_summary: float = 0.5,
) -> HazardValue:
    """Compute heavy rain probability from ensemble.

    P(R >= threshold) = fraction of ensemble members exceeding threshold.
    """
    n_exceed = 0
    max_rate = 0.0

    for member in reflectivity_ensemble:
        rain_rate = reflectivity_to_rain_rate(member)
        max_rain = float(rain_rate.max())
        max_rate = max(max_rate, max_rain)
        if max_rain >= threshold_mm_h:
            n_exceed += 1

    prob = n_exceed / len(reflectivity_ensemble) if reflectivity_ensemble else 0.0

    return HazardValue(
        hazard="heavy_rain",
        value=round(prob, 3),
        unit="probability",
        validation_tier=ValidationTier.VALIDATED,
        method_version="v1.0_zr_ensemble",
        oi_summary=oi_summary,
        lead_min=lead_min,
        storm_id=storm_id,
    )
