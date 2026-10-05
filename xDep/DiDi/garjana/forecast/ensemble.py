"""Ensemble generation for probabilistic forecasts.

R18: Default live ensemble N=8 (motion-field perturbation).
N=16 STEPS-style precomputed into replay bundle.
Never fake an ensemble with blurring.
"""
from __future__ import annotations

import numpy as np

from forecast.extrapolate import extrapolate_semi_lagrangian
from forecast.motion import perturb_motion_field


def generate_ensemble(
    field: np.ndarray,
    motion: np.ndarray,
    n_members: int = 8,
    n_steps: int = 12,
    perturbation_std: float = 2.0,
    seed: int = 42,
) -> list[np.ndarray]:
    """Generate ensemble of extrapolation forecasts.

    R18: Uses motion-field perturbation, NOT blurring.

    Args:
        field: Input field (ny, nx).
        motion: Base motion field (2, ny, nx).
        n_members: Number of ensemble members (default 8 for live).
        n_steps: Number of forecast steps.
        perturbation_std: Motion perturbation std in pixels.
        seed: Random seed for reproducibility.

    Returns:
        List of forecast arrays, each (n_steps, ny, nx).
    """
    rng = np.random.RandomState(seed)

    # Generate perturbed motion fields
    perturbed_motions = perturb_motion_field(
        motion, n_members, perturbation_std, rng
    )

    # Extrapolate with each perturbed motion
    ensemble = []
    for member_motion in perturbed_motions:
        forecast = extrapolate_semi_lagrangian(field, member_motion, n_steps)
        ensemble.append(forecast)

    return ensemble


def compute_exceedance_probabilities(
    ensemble: list[np.ndarray],
    thresholds: list[float],
) -> dict[float, np.ndarray]:
    """Compute exceedance probabilities from ensemble.

    P(field >= threshold) per lead time per grid cell.

    Args:
        ensemble: List of forecast arrays (n_steps, ny, nx).
        thresholds: Threshold values.

    Returns:
        Dict mapping threshold to probability array (n_steps, ny, nx).
    """
    n_members = len(ensemble)
    if n_members == 0:
        return {}

    probs = {}
    for thresh in thresholds:
        # Count members exceeding threshold
        exceed_count = np.zeros_like(ensemble[0], dtype=np.float32)
        for member in ensemble:
            exceed_count += (member >= thresh).astype(np.float32)

        probs[thresh] = exceed_count / n_members

    return probs


def ensemble_statistics(
    ensemble: list[np.ndarray],
) -> dict[str, np.ndarray]:
    """Compute ensemble statistics.

    R1: All values are computed, never fabricated.
    """
    stack = np.stack(ensemble, axis=0)  # (n_members, n_steps, ny, nx)

    return {
        "mean": np.mean(stack, axis=0),
        "std": np.std(stack, axis=0),
        "median": np.median(stack, axis=0),
        "p10": np.percentile(stack, 10, axis=0),
        "p90": np.percentile(stack, 90, axis=0),
        "min": np.min(stack, axis=0),
        "max": np.max(stack, axis=0),
    }
