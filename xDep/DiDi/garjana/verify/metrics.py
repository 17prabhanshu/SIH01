"""Verification metrics for Garjana.

Categorical: CSI, POD, FAR, HSS at thresholds.
Spatial: Fractions Skill Score (FSS) at multiple scales.
Probabilistic: Brier score, reliability diagrams.
All stratified by Observability Index bucket.
"""
from __future__ import annotations

from typing import Any

import numpy as np


def contingency_table(
    forecast: np.ndarray,
    observed: np.ndarray,
    threshold: float,
) -> dict[str, int]:
    """Compute contingency table at a threshold.

    Args:
        forecast: Predicted field (ny, nx).
        observed: Observed field (ny, nx).
        threshold: Threshold for binary classification.

    Returns:
        Dict with hits, misses, false_alarms, correct_negatives.
    """
    f_bin = (forecast >= threshold).astype(int)
    o_bin = (observed >= threshold).astype(int)

    hits = int(np.sum((f_bin == 1) & (o_bin == 1)))
    misses = int(np.sum((f_bin == 0) & (o_bin == 1)))
    false_alarms = int(np.sum((f_bin == 1) & (o_bin == 0)))
    correct_negatives = int(np.sum((f_bin == 0) & (o_bin == 0)))

    return {
        "hits": hits,
        "misses": misses,
        "false_alarms": false_alarms,
        "correct_negatives": correct_negatives,
    }


def csi(ct: dict[str, int]) -> float:
    """Critical Success Index (Threat Score)."""
    denom = ct["hits"] + ct["misses"] + ct["false_alarms"]
    return ct["hits"] / denom if denom > 0 else 0.0


def pod(ct: dict[str, int]) -> float:
    """Probability of Detection (Hit Rate)."""
    denom = ct["hits"] + ct["misses"]
    return ct["hits"] / denom if denom > 0 else 0.0


def far(ct: dict[str, int]) -> float:
    """False Alarm Ratio."""
    denom = ct["hits"] + ct["false_alarms"]
    return ct["false_alarms"] / denom if denom > 0 else 0.0


def hss(ct: dict[str, int]) -> float:
    """Heidke Skill Score."""
    n = ct["hits"] + ct["misses"] + ct["false_alarms"] + ct["correct_negatives"]
    if n == 0:
        return 0.0
    a = ct["hits"]
    b = ct["false_alarms"]
    c = ct["misses"]
    d = ct["correct_negatives"]
    expected = ((a + c) * (a + b) + (b + d) * (c + d)) / n
    denom = n - expected
    return (a + d - expected) / denom if denom > 0 else 0.0


def fss(
    forecast: np.ndarray,
    observed: np.ndarray,
    threshold: float,
    scale: int,
) -> float:
    """Fractions Skill Score at a given neighbourhood scale.

    Args:
        forecast: Predicted field (ny, nx).
        observed: Observed field (ny, nx).
        threshold: Threshold for binary classification.
        scale: Neighbourhood size in pixels (must be odd).

    Returns:
        FSS value in [0, 1].
    """
    from scipy.ndimage import uniform_filter

    if scale % 2 == 0:
        scale += 1  # Ensure odd

    f_bin = (forecast >= threshold).astype(np.float64)
    o_bin = (observed >= threshold).astype(np.float64)

    # Fraction fields
    f_frac = uniform_filter(f_bin, size=scale, mode='constant')
    o_frac = uniform_filter(o_bin, size=scale, mode='constant')

    # MSE and reference MSE
    mse = np.mean((f_frac - o_frac) ** 2)
    mse_ref = np.mean(f_frac ** 2) + np.mean(o_frac ** 2)

    if mse_ref == 0:
        return 1.0  # Both empty

    return 1.0 - mse / mse_ref


def brier_score(
    probabilities: np.ndarray,
    observations: np.ndarray,
) -> float:
    """Brier Score for probabilistic forecasts.

    Args:
        probabilities: Predicted probabilities (N,) in [0, 1].
        observations: Binary observations (N,) in {0, 1}.

    Returns:
        Brier score (lower is better).
    """
    return float(np.mean((probabilities - observations) ** 2))


def reliability_diagram(
    probabilities: np.ndarray,
    observations: np.ndarray,
    n_bins: int = 10,
) -> dict[str, Any]:
    """Compute reliability diagram data.

    Args:
        probabilities: Predicted probabilities.
        observations: Binary observations.
        n_bins: Number of probability bins.

    Returns:
        Dict with bin_centers, observed_freq, forecast_freq, counts.
    """
    bin_edges = np.linspace(0, 1, n_bins + 1)
    bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2

    observed_freq = np.zeros(n_bins)
    forecast_freq = np.zeros(n_bins)
    counts = np.zeros(n_bins, dtype=int)

    for i in range(n_bins):
        mask = (probabilities >= bin_edges[i]) & (probabilities < bin_edges[i + 1])
        if i == n_bins - 1:  # Include upper edge in last bin
            mask = mask | (probabilities == bin_edges[i + 1])

        counts[i] = int(mask.sum())
        if counts[i] > 0:
            observed_freq[i] = float(observations[mask].mean())
            forecast_freq[i] = float(probabilities[mask].mean())

    return {
        "bin_centers": bin_centers.tolist(),
        "observed_freq": observed_freq.tolist(),
        "forecast_freq": forecast_freq.tolist(),
        "counts": counts.tolist(),
        "brier_score": brier_score(probabilities, observations),
    }


def compute_all_metrics(
    forecast: np.ndarray,
    observed: np.ndarray,
    thresholds: list[float],
    fss_scales: list[int] | None = None,
) -> dict[str, Any]:
    """Compute all categorical and spatial metrics.

    Args:
        forecast: Predicted field (ny, nx).
        observed: Observed field (ny, nx).
        thresholds: List of thresholds for binary metrics.
        fss_scales: List of neighbourhood scales for FSS.

    Returns:
        Dict with all metrics indexed by threshold.
    """
    if fss_scales is None:
        fss_scales = [1, 5, 11, 21, 41]

    results: dict[str, Any] = {}

    for thresh in thresholds:
        ct = contingency_table(forecast, observed, thresh)
        key = f"threshold_{thresh}"
        results[key] = {
            "contingency": ct,
            "csi": csi(ct),
            "pod": pod(ct),
            "far": far(ct),
            "hss": hss(ct),
            "fss": {},
        }
        for scale in fss_scales:
            results[key]["fss"][f"scale_{scale}"] = fss(
                forecast, observed, thresh, scale
            )

    return results
