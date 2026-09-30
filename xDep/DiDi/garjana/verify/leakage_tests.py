"""Leakage detection tests (R5).

R5: No hindsight leakage. Feature builders take (data, t) and may only
read valid_time <= t. This module provides property tests.
"""
from __future__ import annotations

import datetime

import numpy as np

from core.types import Observation


def check_no_future_data(
    feature_builder: callable,
    observations: list[Observation],
    target_time: datetime.datetime,
) -> bool:
    """Verify that a feature builder only uses data with valid_time <= target_time.

    R5: Shuffles future data and asserts identical features.

    Args:
        feature_builder: Function (observations, t) -> features
        observations: All available observations (past and future)
        target_time: The time for which features are being built

    Returns:
        True if no leakage detected.
    """
    # Build features with all data available
    features_all = feature_builder(observations, target_time)

    # Shuffle future observations (those with valid_time > target_time)
    modified_obs = []
    for obs in observations:
        if obs.valid_time > target_time:
            # Replace future data with random noise
            rng = np.random.RandomState(999)
            noisy = Observation(
                source=obs.source,
                valid_time=obs.valid_time,
                received_time=obs.received_time,
                fidelity=obs.fidelity,
                grid=rng.randn(*obs.grid.shape).astype(np.float32) if obs.grid is not None else None,
                qc=obs.qc,
                meta=obs.meta,
            )
            modified_obs.append(noisy)
        else:
            modified_obs.append(obs)

    # Build features with shuffled future data
    features_modified = feature_builder(modified_obs, target_time)

    # Features must be identical
    if isinstance(features_all, np.ndarray) and isinstance(features_modified, np.ndarray):
        return np.array_equal(features_all, features_modified)
    elif isinstance(features_all, dict) and isinstance(features_modified, dict):
        for k in features_all:
            if not np.array_equal(features_all[k], features_modified[k]):
                return False
        return True
    elif isinstance(features_all, list) and isinstance(features_modified, list):
        if len(features_all) != len(features_modified):
            return False
        for a, b in zip(features_all, features_modified):
            if not np.array_equal(a, b):
                return False
        return True
    return features_all == features_modified
