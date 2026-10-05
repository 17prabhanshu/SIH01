import pytest
import numpy as np

from core.types import HazardValue, ValidationTier
from hazards.tiers import validate_hazard, is_experimental, EXPERIMENTAL_HAZARDS
from hazards.rain import reflectivity_to_rain_rate, compute_rain_hazard
from hazards.lightning import compute_lightning_hazard
from hazards.hail import compute_hail_hazard
from hazards.wind import compute_wind_hazard
from hazards.extreme_rain import compute_extreme_rain_risk


def test_tiers_validate_hazard_valid():
    hv = HazardValue(
        hazard="lightning",
        value=0.5,
        unit="prob",
        validation_tier=ValidationTier.VALIDATED,
        method_version="v1",
        oi_summary=0.8,
        lead_min=10
    )
    assert validate_hazard(hv) == hv

def test_tiers_validate_hazard_invalid_tier():
    # lightning cannot be EXPERIMENTAL based on ALLOWED_TIERS
    hv = HazardValue(
        hazard="lightning",
        value=0.5,
        unit="prob",
        validation_tier=ValidationTier.EXPERIMENTAL,
        method_version="v1",
        oi_summary=0.8,
        lead_min=10
    )
    with pytest.raises(ValueError, match="cannot have tier"):
        validate_hazard(hv)

def test_tiers_validate_hazard_missing_tier():
    # It requires validation_tier to be present
    with pytest.raises(ValueError):
        HazardValue(
            hazard="lightning",
            value=0.5,
            unit="prob",
            validation_tier=None,
            method_version="v1",
            oi_summary=0.8,
            lead_min=10
        )

def test_tiers_is_experimental():
    assert is_experimental("hail")
    assert is_experimental("wind")
    assert is_experimental("extreme_rain")
    assert not is_experimental("lightning")

def test_rain_reflectivity_to_rain_rate():
    dbz = np.array([10.0, 30.0, 50.0])
    rr = reflectivity_to_rain_rate(dbz, a=250.0, b=1.2)
    assert rr.shape == (3,)
    assert rr[0] < rr[1] < rr[2]

def test_rain_compute_rain_hazard():
    ens = [np.array([50.0]), np.array([60.0])] # high dbz
    hazard = compute_rain_hazard(ens, threshold_mm_h=10.0)
    assert hazard.hazard == "heavy_rain"
    assert hazard.value > 0

def test_lightning_compute_hazard():
    vil = np.array([50.0])
    hazard = compute_lightning_hazard(
        vil=vil,
        flash_rate=10.0,
        flash_rate_prev=2.0, # Jump!
        cape=1500,
        has_real_lightning=True,
    )
    assert hazard.hazard == "lightning"
    assert hazard.validation_tier == ValidationTier.VALIDATED
    assert hazard.value > 0

def test_hail_compute_hazard():
    hazard = compute_hail_hazard(vil=5.0)
    assert hazard.hazard == "hail"
    # Hail is always EXPERIMENTAL or ENVIRONMENT_ONLY
    assert hazard.validation_tier in [ValidationTier.EXPERIMENTAL, ValidationTier.ENVIRONMENT_ONLY]

def test_wind_compute_hazard():
    hazard = compute_wind_hazard(dcape=1000.0, max_dbz=50.0)
    assert hazard.hazard == "wind"
    assert hazard.validation_tier in [ValidationTier.EXPERIMENTAL, ValidationTier.ENVIRONMENT_ONLY]

def test_extreme_rain_compute_hazard():
    hazard = compute_extreme_rain_risk(reflectivity_ensemble=[np.array([60.0])])
    assert hazard.hazard == "extreme_rain"
    assert hazard.validation_tier in [ValidationTier.EXPERIMENTAL, ValidationTier.ENVIRONMENT_ONLY]
