"""Baseline computation for verification.

R7: Always compute baselines (persistence, pysteps LK extrapolation).
ML predicts a RESIDUAL on top of the extrapolation baseline.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np

from forecast.extrapolate import (
    extrapolate_semi_lagrangian,
    persistence_forecast,
)
from forecast.motion import estimate_motion_lk
from verify.metrics import compute_all_metrics


def evaluate_baselines(
    context_frames: list[np.ndarray],
    truth_frames: list[np.ndarray],
    thresholds: list[float] | None = None,
    fss_scales: list[int] | None = None,
) -> dict[str, Any]:
    """Evaluate persistence and extrapolation baselines.

    Args:
        context_frames: Input frames (oldest to newest).
        truth_frames: Ground truth future frames.
        thresholds: Verification thresholds.
        fss_scales: FSS neighbourhood scales.

    Returns:
        Dict with per-lead-time metrics for each baseline.
    """
    if thresholds is None:
        thresholds = [20.0, 30.0, 40.0]
    if fss_scales is None:
        fss_scales = [1, 5, 11, 21]

    n_steps = len(truth_frames)
    last_frame = context_frames[-1]

    # Persistence baseline
    persistence = persistence_forecast(last_frame, n_steps)

    # Extrapolation baseline
    try:
        motion = estimate_motion_lk(context_frames)
        extrapolation = extrapolate_semi_lagrangian(last_frame, motion, n_steps)
    except Exception:
        # If motion estimation fails, fall back to persistence
        extrapolation = persistence
        motion = None

    results: dict[str, Any] = {
        "persistence": {},
        "extrapolation": {},
    }

    for step_idx in range(n_steps):
        lead_min = (step_idx + 1) * 10
        truth = truth_frames[step_idx]

        results["persistence"][f"lead_{lead_min}"] = compute_all_metrics(
            persistence[step_idx], truth, thresholds, fss_scales
        )
        results["extrapolation"][f"lead_{lead_min}"] = compute_all_metrics(
            extrapolation[step_idx], truth, thresholds, fss_scales
        )

    return results


def save_baseline_results(
    results: dict[str, Any],
    output_path: str | Path = "eval/baselines.json",
) -> None:
    """Save baseline evaluation results to JSON."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
