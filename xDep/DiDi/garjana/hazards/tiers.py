"""Hazard validation tier enforcement.

R3: Every hazard output carries validation_tier. The API rejects and
the UI refuses to render any hazard value lacking a tier.
R4: Hail, wind, extreme rain are always experimental or environment_only.
"""
from __future__ import annotations

from core.types import HazardValue, ValidationTier

# R4: These hazards are ALWAYS experimental or environment_only
EXPERIMENTAL_HAZARDS = {"hail", "wind", "extreme_rain"}

# Allowed tiers per hazard (R4 enforcement)
ALLOWED_TIERS = {
    "lightning": {ValidationTier.VALIDATED, ValidationTier.PROXY},
    "heavy_rain": {ValidationTier.VALIDATED, ValidationTier.EXPERIMENTAL},
    "extreme_rain": {ValidationTier.EXPERIMENTAL, ValidationTier.ENVIRONMENT_ONLY},
    "hail": {ValidationTier.EXPERIMENTAL, ValidationTier.ENVIRONMENT_ONLY},
    "wind": {ValidationTier.EXPERIMENTAL, ValidationTier.ENVIRONMENT_ONLY},
}


def validate_hazard(hazard: HazardValue) -> HazardValue:
    """Validate a hazard value against tier rules.

    R3: Raises ValueError if validation_tier is missing.
    R4: Raises ValueError if tier is invalid for the hazard type.

    Returns the hazard if valid.
    """
    if hazard.validation_tier is None:
        raise ValueError(
            f"HazardValue for '{hazard.hazard}' MUST have validation_tier (R3)"
        )

    if hazard.hazard in ALLOWED_TIERS:
        allowed = ALLOWED_TIERS[hazard.hazard]
        if hazard.validation_tier not in allowed:
            raise ValueError(
                f"Hazard '{hazard.hazard}' cannot have tier "
                f"'{hazard.validation_tier.value}'. "
                f"Allowed: {[t.value for t in allowed]} (R4)"
            )

    return hazard


def is_experimental(hazard_name: str) -> bool:
    """Check if a hazard is always experimental."""
    return hazard_name in EXPERIMENTAL_HAZARDS
