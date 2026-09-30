"""Tests for time utilities."""
import datetime

from core.time import (
    CONTEXT_FRAMES,
    FORECAST_STEPS,
    align_to_cycle,
    context_window,
    cycle_times,
    forecast_valid_times,
)


def test_align_to_cycle():
    dt = datetime.datetime(2024, 8, 15, 14, 37, 22)
    aligned = align_to_cycle(dt)
    assert aligned.minute == 30
    assert aligned.second == 0
    assert aligned.microsecond == 0


def test_align_on_boundary():
    dt = datetime.datetime(2024, 8, 15, 14, 30, 0)
    assert align_to_cycle(dt) == dt


def test_cycle_times():
    start = datetime.datetime(2024, 8, 15, 14, 0)
    end = datetime.datetime(2024, 8, 15, 15, 0)
    times = list(cycle_times(start, end))
    assert len(times) == 7  # 14:00, 14:10, ..., 15:00
    assert times[0].minute == 0
    assert times[-1].minute == 0
    assert times[-1].hour == 15


def test_context_window():
    t = datetime.datetime(2024, 8, 15, 15, 0)
    window = context_window(t)
    assert len(window) == CONTEXT_FRAMES
    assert window[-1] == t  # Most recent is last
    assert window[0] == t - datetime.timedelta(minutes=50)  # Oldest


def test_forecast_valid_times():
    t = datetime.datetime(2024, 8, 15, 15, 0)
    fvt = forecast_valid_times(t)
    assert len(fvt) == FORECAST_STEPS
    assert fvt[0] == t + datetime.timedelta(minutes=10)
    assert fvt[-1] == t + datetime.timedelta(minutes=120)
