"""Tests for core types.

Verifies R2 (provenance), R3 (validation tier enforcement),
R10 (alerts start as draft).
"""
import datetime

import pytest

from core.types import (
    Alert,
    AlertStatus,
    Fidelity,
    GridSpec,
    HazardValue,
    ObservabilityIndex,
    Observation,
    RunMode,
    SystemMode,
    ValidationTier,
)


class TestObservation:
    def test_creation_with_provenance(self):
        """R2: Every observation must carry full provenance."""
        now = datetime.datetime.now(datetime.timezone.utc)
        obs = Observation(
            source="radar:LKO",
            valid_time=now - datetime.timedelta(minutes=5),
            received_time=now,
            fidelity=Fidelity.NATIVE,
            qc={"missing_frac": 0.02},
            meta={"product_id": "CMAX"},
        )
        assert obs.source == "radar:LKO"
        assert obs.fidelity == Fidelity.NATIVE
        assert obs.age_minutes == pytest.approx(5.0, abs=0.1)
        assert not obs.is_synthetic

    def test_synthetic_flagged(self):
        """R2: Synthetic data must be labelled."""
        now = datetime.datetime.now(datetime.timezone.utc)
        obs = Observation(
            source="synthetic:test",
            valid_time=now,
            received_time=now,
            fidelity=Fidelity.SYNTHETIC,
        )
        assert obs.is_synthetic
        assert obs.fidelity == Fidelity.SYNTHETIC


class TestHazardValue:
    def test_requires_validation_tier(self):
        """R3: HazardValue MUST have validation_tier."""
        # Valid creation
        h = HazardValue(
            hazard="lightning",
            value=0.75,
            unit="probability",
            validation_tier=ValidationTier.VALIDATED,
            method_version="v1.0",
            oi_summary=0.8,
            lead_min=30,
        )
        assert h.validation_tier == ValidationTier.VALIDATED

    def test_none_tier_raises(self):
        """R3: None tier must raise ValueError."""
        with pytest.raises(ValueError, match="validation_tier"):
            HazardValue(
                hazard="lightning",
                value=0.75,
                unit="probability",
                validation_tier=None,  # type: ignore
                method_version="v1.0",
                oi_summary=0.8,
                lead_min=30,
            )

    def test_experimental_hazards(self):
        """R4: Hail, wind, extreme rain are experimental."""
        for hazard in ["hail", "wind", "extreme_rain"]:
            h = HazardValue(
                hazard=hazard,
                value=0.5,
                unit="probability",
                validation_tier=ValidationTier.EXPERIMENTAL,
                method_version="v1.0",
                oi_summary=0.6,
                lead_min=30,
            )
            assert h.validation_tier == ValidationTier.EXPERIMENTAL


class TestAlert:
    def test_starts_as_draft(self):
        """R10: Alerts start as DRAFT."""
        a = Alert(alert_id="test-001")
        assert a.status == AlertStatus.DRAFT

    def test_draft_no_approver(self):
        """R10: DRAFT alerts cannot have an approver."""
        with pytest.raises(ValueError, match="DRAFT"):
            Alert(alert_id="test-001", approved_by="someone")


class TestGridSpec:
    def test_default_grid(self):
        spec = GridSpec(center_lat=26.76, center_lon=80.89)
        assert spec.nx == 256
        assert spec.ny == 256
        assert spec.dx_m == 2000.0


class TestObservabilityIndex:
    def test_composite(self):
        oi = ObservabilityIndex(
            radar_coverage=1.0,
            radar_freshness=1.0,
            sat_geometry=1.0,
            ltg_coverage=1.0,
            env_resolution=1.0,
        )
        assert oi.composite == 1.0

    def test_zero_coverage(self):
        oi = ObservabilityIndex()  # all zeros
        assert oi.composite == 0.0


class TestEnums:
    def test_fidelity_values(self):
        assert Fidelity.NATIVE.value == "native"
        assert Fidelity.SYNTHETIC.value == "synthetic"

    def test_system_modes(self):
        assert SystemMode.FULL.value == "FULL"
        assert SystemMode.BASELINE.value == "BASELINE"

    def test_run_modes(self):
        assert RunMode.LIVE.value == "LIVE"
        assert RunMode.REPLAY.value == "REPLAY"
        assert RunMode.SYNTHETIC.value == "SYNTHETIC"
