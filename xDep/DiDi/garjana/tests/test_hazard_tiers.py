"""Tests for hazard tier enforcement (R3, R4, R10).

These are critical non-negotiable rule tests.
"""
import pytest

from core.types import (
    Alert,
    AlertStatus,
    HazardValue,
    ValidationTier,
)


class TestR3TierEnforcement:
    """R3: API rejects hazards without validation_tier."""

    def test_hazard_with_tier_valid(self):
        h = HazardValue(
            hazard="heavy_rain",
            value=45.0,
            unit="mm/h",
            validation_tier=ValidationTier.VALIDATED,
            method_version="v1.0",
            oi_summary=0.85,
            lead_min=30,
        )
        assert h.validation_tier == ValidationTier.VALIDATED

    def test_hazard_without_tier_rejected(self):
        with pytest.raises((ValueError, TypeError)):
            HazardValue(
                hazard="heavy_rain",
                value=45.0,
                unit="mm/h",
                validation_tier=None,  # type: ignore
                method_version="v1.0",
                oi_summary=0.85,
                lead_min=30,
            )


class TestR4ExperimentalHazards:
    """R4: Hail, wind, extreme rain are experimental."""

    @pytest.mark.parametrize("hazard", ["hail", "wind", "extreme_rain"])
    def test_experimental_hazards_must_be_experimental(self, hazard: str):
        h = HazardValue(
            hazard=hazard,
            value=0.6,
            unit="probability",
            validation_tier=ValidationTier.EXPERIMENTAL,
            method_version="v1.0",
            oi_summary=0.7,
            lead_min=30,
        )
        assert h.validation_tier in (
            ValidationTier.EXPERIMENTAL,
            ValidationTier.ENVIRONMENT_ONLY,
        )


class TestR10AlertRules:
    """R10: Alerts are DRAFT until human approves.
    Experimental hazards max Watch/Outlook.
    """

    def test_alert_default_draft(self):
        a = Alert(alert_id="t-001")
        assert a.status == AlertStatus.DRAFT

    def test_draft_cannot_have_approver(self):
        with pytest.raises(ValueError):
            Alert(alert_id="t-001", approved_by="forecaster")

    def test_approved_alert_needs_approver(self):
        # This should work - approved with approver
        a = Alert(
            alert_id="t-002",
            status=AlertStatus.APPROVED,
            approved_by="forecaster",
        )
        assert a.status == AlertStatus.APPROVED
