import numpy as np
from forecast.extrapolate import persistence_forecast, extrapolate_semi_lagrangian, _simple_advection
from forecast.ensemble import generate_ensemble, compute_exceedance_probabilities, ensemble_statistics
from forecast.blender import blend_forecasts
from forecast.motion import perturb_motion_field

def test_persistence():
    field = np.random.rand(10, 10)
    n_steps = 5
    forecast = persistence_forecast(field, n_steps=n_steps)
    
    assert forecast.shape == (n_steps, 10, 10)
    for i in range(n_steps):
        assert np.array_equal(forecast[i], field)

def test_extrapolate_semi_lagrangian():
    field = np.ones((10, 10))
    motion = np.zeros((2, 10, 10))
    n_steps = 5
    
    # zero motion -> persistence
    forecast = extrapolate_semi_lagrangian(field, motion, n_steps=n_steps)
    assert forecast.shape == (n_steps, 10, 10)
    assert np.all(forecast == 1.0)
    
    # test values non negative
    assert np.all(forecast >= 0.0)

def test_ensemble():
    field = np.ones((10, 10))
    motion = np.zeros((2, 10, 10))
    n_members = 4
    n_steps = 3
    
    ens = generate_ensemble(field, motion, n_members=n_members, n_steps=n_steps, perturbation_std=1.0)
    assert len(ens) == n_members
    for m in ens:
        assert m.shape == (n_steps, 10, 10)
        
    # members are perturbed (in general not all identical if field/motion allow, but here field is constant and motion is 0. Wait, motion is zero but perturbed motion is non-zero, advecting constant field might still be constant. Let's make a non-constant field to ensure differences.)
    field_var = np.random.rand(50, 50)
    motion_var = np.zeros((2, 50, 50))
    ens_var = generate_ensemble(field_var, motion_var, n_members=2, n_steps=2, perturbation_std=0.5)
    assert not np.array_equal(ens_var[0], ens_var[1])

    # compute_exceedance_probabilities
    probs = compute_exceedance_probabilities(ens_var, thresholds=[0.5])
    assert 0.5 in probs
    assert np.all(probs[0.5] >= 0.0)
    assert np.all(probs[0.5] <= 1.0)

def test_ensemble_statistics():
    ens = [np.random.rand(3, 10, 10) for _ in range(4)]
    stats = ensemble_statistics(ens)
    
    expected_keys = ["mean", "std", "median", "p10", "p90", "min", "max"]
    for k in expected_keys:
        assert k in stats
        assert stats[k].shape == (3, 10, 10)
        
    # mean between min and max
    assert np.all(stats["mean"] >= stats["min"])
    assert np.all(stats["mean"] <= stats["max"])

def test_blender():
    h1 = np.ones((10, 10))
    h3 = np.zeros((10, 10))
    
    # lead_min = 10 -> w_h1 = 1.0, w_h3 = 0.0 (blend start=90, end=180)
    res_10, w_h1_10, w_h3_10 = blend_forecasts(h1, h3, lead_min=10, blend_start_min=90, blend_end_min=180)
    assert w_h1_10 == 1.0
    assert w_h3_10 == 0.0
    
    # lead_min = 180 -> w_h1 = 0.0, w_h3 = 1.0
    res_180, w_h1_180, w_h3_180 = blend_forecasts(h1, h3, lead_min=180, blend_start_min=90, blend_end_min=180)
    assert w_h1_180 == 0.0
    assert w_h3_180 == 1.0
    
    # lead_min = 135 -> both > 0
    res_135, w_h1_135, w_h3_135 = blend_forecasts(h1, h3, lead_min=135, blend_start_min=90, blend_end_min=180)
    assert w_h1_135 > 0.0
    assert w_h3_135 > 0.0
