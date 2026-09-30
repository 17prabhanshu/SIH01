import inspect
import pytest
import numpy as np
from hazards.tiers import validate_hazard
from hazards.lightning import compute_lightning_hazard
from hazards.rain import reflectivity_to_rain_rate, compute_rain_hazard
from hazards.extreme_rain import compute_extreme_rain_risk
from hazards.hail import compute_hail_hazard
from hazards.wind import compute_wind_hazard
from core.types import HazardValue, ValidationTier

def test_tiers_enforcement():
    # lightning with VALIDATED tier -> OK
    hv_ltg = HazardValue("lightning", 0.5, "prob", ValidationTier.VALIDATED, "v1", 0.5, 30)
    validate_hazard(hv_ltg)
    
    # hail with VALIDATED tier -> ValueError (R4)
    hv_hail = HazardValue("hail", 0.5, "prob", ValidationTier.VALIDATED, "v1", 0.5, 30)
    with pytest.raises(ValueError):
        validate_hazard(hv_hail)
        
    # extreme_rain with VALIDATED tier -> ValueError
    hv_er = HazardValue("extreme_rain", 0.5, "prob", ValidationTier.VALIDATED, "v1", 0.5, 30)
    with pytest.raises(ValueError):
        validate_hazard(hv_er)
        
    # wind with VALIDATED tier -> ValueError
    hv_wind = HazardValue("wind", 0.5, "prob", ValidationTier.VALIDATED, "v1", 0.5, 30)
    with pytest.raises(ValueError):
        validate_hazard(hv_wind)

def test_lightning_hazard():
    res_low = compute_lightning_hazard(vil=np.array([5.0]), flash_rate=0.0, flash_rate_prev=0.0, has_real_lightning=True)
    res_high = compute_lightning_hazard(vil=np.array([30.0]), flash_rate=0.0, flash_rate_prev=0.0, has_real_lightning=True)
    assert res_high.value > res_low.value
    assert res_high.value > 0
    assert res_high.validation_tier == ValidationTier.VALIDATED
    
    res_proxy = compute_lightning_hazard(vil=np.array([30.0]), flash_rate=0.0, flash_rate_prev=0.0, has_real_lightning=False)
    assert res_proxy.validation_tier == ValidationTier.PROXY
    
    res_jump = compute_lightning_hazard(vil=np.array([30.0]), flash_rate=25.0, flash_rate_prev=10.0, has_real_lightning=True)
    assert res_jump.value > res_high.value

def test_rain_hazard():
    r_0 = reflectivity_to_rain_rate(0.0, a=200.0, b=1.6)
    assert r_0 < 0.1
    
    r_50 = reflectivity_to_rain_rate(50.0, a=200.0, b=1.6)
    assert r_50 > 10.0
    
    # Z-R round-trip
    z = 40.0
    z_linear = 10 ** (z / 10.0)
    # R = (Z/200)^(1/1.6) is the Marshall-Palmer
    expected_r = (z_linear / 200.0) ** (1 / 1.6)
    assert np.isclose(reflectivity_to_rain_rate(z, a=200.0, b=1.6), expected_r, rtol=0.1)
    
    ensemble_above = [np.ones((5, 5)) * 60.0 for _ in range(8)]
    hazard_above = compute_rain_hazard(ensemble_above, threshold_mm_h=50.0)
    assert np.isclose(hazard_above.value, 1.0)
    
    ensemble_below = [np.ones((5, 5)) * 10.0 for _ in range(8)]
    hazard_below = compute_rain_hazard(ensemble_below, threshold_mm_h=50.0)
    assert np.isclose(hazard_below.value, 0.0)

def test_extreme_rain():
    ensemble = [np.ones((5, 5)) * 150.0 for _ in range(8)]
    hazard = compute_extreme_rain_risk(reflectivity_ensemble=ensemble, orography_factor=1.0)
    assert hazard.validation_tier == ValidationTier.EXPERIMENTAL

def test_no_cloudburst_word():
    from hazards import extreme_rain
    import inspect, ast
    source = inspect.getsource(extreme_rain)
    tree = ast.parse(source)
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.Module)):
            if ast.get_docstring(node):
                node.body[0].value.value = ""  # remove docstring
    code_only = ast.unparse(tree)
    assert 'cloudburst' not in code_only.lower()

def test_hail():
    hazard = compute_hail_hazard(vil=15.0, echo_top_km=10.0, freezing_level_km=5.0)
    assert hazard.validation_tier == ValidationTier.EXPERIMENTAL
    assert hazard.value > 0.0

def test_wind():
    hazard = compute_wind_hazard(dcape=1500.0, max_dbz=55.0)
    assert hazard.validation_tier in [ValidationTier.EXPERIMENTAL, ValidationTier.ENVIRONMENT_ONLY]
    assert hazard.value > 0.0
    assert hazard.unit == "probability" # Never outputs a wind speed number
