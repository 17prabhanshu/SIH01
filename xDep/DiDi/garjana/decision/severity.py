"""Severity mapping for alerts.

Maps hazard_tier x probability x exposure -> CAP severity/urgency/certainty.
R10: Experimental hazards max Watch/Outlook, never Warning.
"""
from __future__ import annotations

from core.config import Config
from core.types import (
    AlertCertainty,
    AlertSeverity,
    AlertUrgency,
    ValidationTier,
)


def map_severity(
    validation_tier: ValidationTier,
    probability: float,
) -> tuple[AlertSeverity, AlertUrgency, AlertCertainty]:
    """Map hazard tier and probability to CAP severity/urgency/certainty.

    R10: Experimental hazards NEVER produce Warning (Severe/Extreme).
    """
    try:
        cfg = Config.get("alert_map")
        bins = cfg.get("probability_bins", {})
        p_high = bins.get("high", 0.7)
        p_med = bins.get("medium", 0.4)

        tier_key = validation_tier.value
        mapping = cfg.get("severity_mapping", {}).get(tier_key, {})

        if probability >= p_high:
            level = mapping.get("high_probability", {})
        elif probability >= p_med:
            level = mapping.get("medium_probability", {})
        else:
            level = mapping.get("low_probability", {})

        return (
            AlertSeverity(level.get("severity", "Unknown")),
            AlertUrgency(level.get("urgency", "Unknown")),
            AlertCertainty(level.get("certainty", "Unknown")),
        )
    except (FileNotFoundError, KeyError, ValueError):
        # Fallback defaults
        if validation_tier in (ValidationTier.EXPERIMENTAL, ValidationTier.ENVIRONMENT_ONLY):
            return AlertSeverity.MINOR, AlertUrgency.FUTURE, AlertCertainty.POSSIBLE
        if probability >= 0.7:
            return AlertSeverity.SEVERE, AlertUrgency.IMMEDIATE, AlertCertainty.LIKELY
        return AlertSeverity.MODERATE, AlertUrgency.EXPECTED, AlertCertainty.POSSIBLE
