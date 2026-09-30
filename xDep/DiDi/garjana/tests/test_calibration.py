"""Test calibration and conformal ETA."""
import json
from pathlib import Path
import numpy as np

from verify.calibration import split_conformal_eta, compute_empirical_coverage

def test_conformal_eta_coverage():
    """Test that empirical coverage is within +/- 5% of nominal 80%."""
    rng = np.random.RandomState(42)
    
    # 1000 calibration samples
    cal_truth = rng.uniform(10, 100, 1000)
    cal_etas = cal_truth + rng.normal(0, 15, 1000) # Noise with std 15
    residuals = np.abs(cal_truth - cal_etas)
    
    # 500 test samples
    test_truth = rng.uniform(10, 100, 500)
    test_etas = test_truth + rng.normal(0, 15, 500)
    
    lower, upper = split_conformal_eta(test_etas, residuals, alpha=0.2)
    coverage = compute_empirical_coverage(lower, upper, test_truth)
    
    assert 0.75 <= coverage <= 0.85, f"Coverage {coverage:.3f} outside [0.75, 0.85]"
    
    # Record result for evidence pack
    out_dir = Path("docs/results")
    out_dir.mkdir(parents=True, exist_ok=True)
    with open(out_dir / "eta_coverage.json", "w") as f:
        json.dump({
            "nominal_coverage": 0.80,
            "empirical_coverage": float(coverage),
            "n_calibration": 1000,
            "n_test": 500,
        }, f, indent=2)
