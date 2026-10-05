"""Feature builder for the forecast models.

R5: Feature builders take (data, t) and may only read valid_time <= t.
No hindsight leakage. This is enforced by the build_features function
and tested by the leakage property test.
"""
from __future__ import annotations

import datetime

import numpy as np

from core.types import Observation


def build_features(
    observations: list[Observation],
    target_time: datetime.datetime,
    n_context: int = 6,
) -> dict[str, np.ndarray]:
    """Build feature arrays for forecast models.

    R5: Only uses observations with valid_time <= target_time.
    This is the ONLY entry point for feature construction.

    Args:
        observations: All available observations.
        target_time: The time for which features are being built.
        n_context: Number of context frames to include.

    Returns:
        Dict mapping feature names to numpy arrays.
    """
    # R5: Filter to past-only observations
    past_obs = [
        obs for obs in observations
        if obs.valid_time <= target_time
    ]

    # Group by source type
    radar_obs = sorted(
        [o for o in past_obs if o.source.startswith("radar:") or o.source.startswith("synthetic:") or o.source.startswith("sevir:vil")],
        key=lambda o: o.valid_time,
    )

    sat_obs = sorted(
        [o for o in past_obs if "insat" in o.source or "ir" in o.source.lower() or o.source.startswith("sevir:ir")],
        key=lambda o: o.valid_time,
    )

    ltg_obs = sorted(
        [o for o in past_obs if "lightning" in o.source or "lght" in o.source or o.source.startswith("sevir:lght")],
        key=lambda o: o.valid_time,
    )

    features: dict[str, np.ndarray] = {}

    # Radar context frames (most recent n_context)
    radar_frames = [o.grid for o in radar_obs[-n_context:] if o.grid is not None]
    if radar_frames:
        features["radar_history"] = np.stack(radar_frames, axis=0)

    # Satellite IR (most recent)
    if sat_obs and sat_obs[-1].grid is not None:
        features["ir_tb"] = sat_obs[-1].grid
        # Cooling rate (15-min diff)
        if len(sat_obs) >= 2 and sat_obs[-2].grid is not None:
            dt_min = (sat_obs[-1].valid_time - sat_obs[-2].valid_time).total_seconds() / 60.0
            if dt_min > 0:
                features["ir_cooling_rate"] = (
                    (sat_obs[-1].grid - sat_obs[-2].grid) / (dt_min / 15.0)
                )

    # Lightning density (most recent)
    if ltg_obs and ltg_obs[-1].grid is not None:
        features["lightning_density"] = ltg_obs[-1].grid

    return features
