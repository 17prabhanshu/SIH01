"""Exposure engine: PostGIS spatial join between hazard polygons and assets.

Priority = f(hazard_tier, probability, asset_criticality, OI).
"""
from __future__ import annotations

from core.config import Config
from core.types import HazardValue


def compute_priority_score(
    hazard: HazardValue,
    asset_criticality: float,
    oi: float,
) -> float:
    """Compute priority score for exposure ranking.

    All weights from config/exposure_weights.yaml and shown to operator.
    """
    try:
        cfg = Config.get("exposure_weights")
        tier_mult = cfg.get("tier_multiplier", {})
    except FileNotFoundError:
        tier_mult = {
            "validated": 1.0,
            "experimental": 0.7,
            "environment_only": 0.4,
            "proxy": 0.5,
        }

    tier_factor = tier_mult.get(hazard.validation_tier.value, 0.5)

    # Priority = probability * tier_factor * criticality * OI
    score = hazard.value * tier_factor * asset_criticality * max(oi, 0.1)

    return round(score, 4)
