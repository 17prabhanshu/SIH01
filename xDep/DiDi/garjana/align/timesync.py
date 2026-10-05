"""Time synchronization for multi-source data.

All sources are sampled/held onto the 10-min cycle clock
with an explicit age_minutes field.
"""
from __future__ import annotations

import datetime

from core.types import Observation


def sync_observation_to_cycle(
    obs: Observation,
    cycle_time: datetime.datetime,
    max_age_minutes: float = 15.0,
) -> Observation | None:
    """Sync an observation to the target cycle time.

    Returns None if the observation is too old.
    """
    age = (cycle_time - obs.valid_time).total_seconds() / 60.0
    if age < 0 or age > max_age_minutes:
        return None

    # Observation is valid for this cycle; add age info
    obs.qc["age_minutes"] = round(age, 1)
    obs.qc["cycle_time"] = cycle_time.isoformat()
    return obs


def find_closest_observation(
    observations: list[Observation],
    target_time: datetime.datetime,
    max_age_minutes: float = 15.0,
) -> Observation | None:
    """Find the observation closest to the target time within the age limit."""
    valid_obs = [
        obs for obs in observations
        if abs((obs.valid_time - target_time).total_seconds()) / 60.0 <= max_age_minutes
    ]
    if not valid_obs:
        return None
    return min(
        valid_obs,
        key=lambda o: abs((o.valid_time - target_time).total_seconds()),
    )
