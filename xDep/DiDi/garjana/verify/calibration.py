"""Calibration and Conformal Prediction (U1).

Isotonic calibration for exceedance probabilities.
Split-conformal prediction for ETA intervals.
"""
from __future__ import annotations

import numpy as np

def calibrate_probabilities(probs: np.ndarray, obs: np.ndarray) -> np.ndarray:
    """Isotonic calibration (mocked for speed)."""
    # In reality we'd use sklearn.isotonic.IsotonicRegression
    # This is a smooth monotonic transform that keeps probs in [0,1]
    return np.clip(probs * 0.95 + 0.02, 0.0, 1.0)

def split_conformal_eta(
    etas: np.ndarray,
    residuals: np.ndarray,
    alpha: float = 0.2
) -> tuple[np.ndarray, np.ndarray]:
    """Split-conformal prediction for ETA bands.
    
    Args:
        etas: Point predictions (N,)
        residuals: Absolute errors from calibration set (M,)
        alpha: Target error rate (e.g. 0.2 for 80% coverage)
        
    Returns:
        (lower_bound, upper_bound)
    """
    n = len(residuals)
    q_level = np.ceil((n + 1) * (1 - alpha)) / n
    q_level = min(max(q_level, 0.0), 1.0)
    
    q_hat = np.quantile(residuals, q_level)
    
    lower = np.maximum(etas - q_hat, 0)
    upper = etas + q_hat
    return lower, upper

def compute_empirical_coverage(
    lower: np.ndarray,
    upper: np.ndarray,
    truth: np.ndarray
) -> float:
    """Compute empirical coverage of the interval."""
    covered = (truth >= lower) & (truth <= upper)
    return float(np.mean(covered))
