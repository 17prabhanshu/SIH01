"""Time utilities for Garjana.

Provides cycle-aligned time handling and the replay clock interface.
"""
from __future__ import annotations

import datetime
from typing import Iterator

CYCLE_MINUTES = 10  # IMD DWR volume scan cadence
CONTEXT_FRAMES = 6  # 60 min lookback
FORECAST_STEPS = 12  # 120 min forecast (H1)

def align_to_cycle(dt: datetime.datetime) -> datetime.datetime:
    """Align a datetime to the nearest past 10-minute cycle boundary."""
    minute = (dt.minute // CYCLE_MINUTES) * CYCLE_MINUTES
    return dt.replace(minute=minute, second=0, microsecond=0)

def cycle_times(
    start: datetime.datetime,
    end: datetime.datetime,
) -> Iterator[datetime.datetime]:
    """Generate 10-minute cycle times from start to end (inclusive)."""
    current = align_to_cycle(start)
    end_aligned = align_to_cycle(end)
    while current <= end_aligned:
        yield current
        current += datetime.timedelta(minutes=CYCLE_MINUTES)

def context_window(t: datetime.datetime) -> list[datetime.datetime]:
    """Return the 6-frame context window ending at time t."""
    return [
        t - datetime.timedelta(minutes=CYCLE_MINUTES * i)
        for i in range(CONTEXT_FRAMES - 1, -1, -1)
    ]

def forecast_valid_times(t: datetime.datetime) -> list[datetime.datetime]:
    """Return the 12 forecast valid times starting from t+10min."""
    return [
        t + datetime.timedelta(minutes=CYCLE_MINUTES * (i + 1))
        for i in range(FORECAST_STEPS)
    ]
