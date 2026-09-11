import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from services.fusion.replay import EventReplayEngine

@pytest.mark.asyncio
async def test_replay_has_no_future_data_leakage():
    """
    Ensures that when the ReplayEngine is given a specific historical time context,
    the resulting FusionResult is strictly bounded to that time context,
    preventing any hindsight/time-travel leakage.
    """
    engine = EventReplayEngine()
    
    # Test coordinates (Gangtok)
    lat = 27.3314
    lon = 88.6138
    
    # Set a historical timestamp BEFORE the Oct 2023 disaster
    time_context = datetime(2023, 10, 1, 12, 0, tzinfo=timezone.utc)
    
    # Execute a single-step replay
    steps = await engine.execute_replay(lat, lon, [time_context])
    
    assert len(steps) == 1
    step = steps[0]
    
    # 1. Verification: The timestamp on the result MUST EXACTLY MATCH the context (no future leakage)
    assert step.fusion_result.timestamp == time_context
    assert step.timestamp == time_context
    
    # 2. Verification: Data Freshness reflects historical state, not live state
    assert step.fusion_result.data_freshness["rainfall"] == "HISTORICAL"
    assert step.fusion_result.data_freshness["elevation"] == "HISTORICAL"
    
    # Sentinel-1 might be HISTORICAL or UNAVAILABLE depending on exact windows, but MUST NOT be LIVE
    assert step.fusion_result.data_freshness["sar_amplitude_change"] != "LIVE"
    
    # LHASA might be AUTH_REQUIRED, but if it had data, it MUST NOT be LIVE
    assert step.fusion_result.data_freshness["lhasa_nowcast"] != "LIVE"
    
    # 3. Verification: The alert generation must rely purely on the available evidence score at that time
    if step.alert is not None:
        assert step.alert.timestamp <= time_context
