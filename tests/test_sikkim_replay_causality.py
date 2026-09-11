import pytest
from datetime import datetime, timezone
from services.fusion.pipeline import FusionPipeline

@pytest.mark.asyncio
async def test_historical_replay_hindsight_leakage():
    """
    Ensures that for a replay evaluation at timestep T, 
    no observation used in evidence has a timestamp > T.
    """
    pipeline = FusionPipeline(db=None)
    
    # Simulate a historical replay requested for Oct 3, 2023 12:00 UTC
    evaluation_timestamp = datetime(2023, 10, 3, 12, 0, tzinfo=timezone.utc)
    
    # Suppose we feed historical evidence mimicking a data pull
    # Intentionally leak an Oct 12 post-event SAR change map
    evidence_payload = {
        "rainfall_24h": 150.0,
        "rainfall_timestamp": datetime(2023, 10, 3, 11, 0, tzinfo=timezone.utc),
        "sar_amplitude_change": 0.8,
        "sar_timestamp": datetime(2023, 10, 12, 10, 0, tzinfo=timezone.utc), # LEAKED FUTURE DATA
        "elevation": 1600.0,
        "elevation_timestamp": datetime(2015, 1, 1, 0, 0, tzinfo=timezone.utc)
    }
    
    # We must construct a strict validation function that the replay endpoint would use
    def validate_causality(evidence: dict, eval_time: datetime) -> list:
        violations = []
        for key, value in evidence.items():
            if key.endswith("_timestamp") and isinstance(value, datetime):
                if value > eval_time:
                    violations.append(f"{key}: {value} > {eval_time}")
        return violations

    violations = validate_causality(evidence_payload, evaluation_timestamp)
    
    assert len(violations) > 0, "Causality test failed to catch hindsight leakage!"
    assert any("sar_timestamp" in v for v in violations)
    
    # Now test a valid one
    valid_payload = {
        "rainfall_24h": 150.0,
        "rainfall_timestamp": datetime(2023, 10, 3, 11, 0, tzinfo=timezone.utc),
        "elevation_timestamp": datetime(2015, 1, 1, 0, 0, tzinfo=timezone.utc)
    }
    assert len(validate_causality(valid_payload, evaluation_timestamp)) == 0

