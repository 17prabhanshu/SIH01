import pytest
from datetime import datetime, timezone
from services.ingestion.lhasa import LhasaAdapter

def test_lhasa_adapter_auth_blocked():
    """Verify the adapter correctly reports the AUTH_REQUIRED state and provenance."""
    adapter = LhasaAdapter()
    result = adapter.get_lhasa_assessment(27.3314, 88.6138)
    
    assert result["status"] == "AUTH_REQUIRED"
    assert result["value"] is None
    assert result["product"] == "Global_Landslide_Nowcast.2.0.0"
    assert "Earthdata Login" in result["provenance"]["root_cause"]

def test_lhasa_adapter_preserves_timestamp():
    """Verify that historical timestamps are explicitly preserved."""
    adapter = LhasaAdapter()
    obs_time = datetime(2021, 2, 9, tzinfo=timezone.utc)
    result = adapter.get_lhasa_assessment(27.3314, 88.6138, observation_time=obs_time)
    
    assert result["timestamp"] == obs_time.isoformat()
    
def test_lhasa_adapter_no_synthetic_data():
    """Verify that the adapter never falls back to synthetic or fabricated data."""
    adapter = LhasaAdapter()
    result = adapter.get_lhasa_assessment(0.0, 0.0)
    
    assert result["value"] is None
    assert "fabricated" not in str(result)
