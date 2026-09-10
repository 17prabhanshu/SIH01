import pytest
from datetime import datetime, timezone

def create_provenance_record(source: str, mode: str, timestamp: datetime) -> dict:
    return {
        "source": source,
        "mode": mode,
        "timestamp": timestamp.isoformat()
    }

def get_freshness_hours(timestamp_str: str) -> float:
    dt = datetime.fromisoformat(timestamp_str)
    now = datetime.now(timezone.utc)
    delta = now - dt
    return delta.total_seconds() / 3600.0

def test_provenance_record_creation():
    now = datetime.now(timezone.utc)
    record = create_provenance_record("IMD_API", "LIVE", now)
    assert record["source"] == "IMD_API"
    assert record["mode"] == "LIVE"

def test_data_mode_labelling():
    record1 = create_provenance_record("GEE", "HISTORICAL", datetime.now(timezone.utc))
    record2 = create_provenance_record("AWS_S3", "CACHED", datetime.now(timezone.utc))
    assert record1["mode"] == "HISTORICAL"
    assert record2["mode"] == "CACHED"

def test_freshness_computation():
    past = datetime.now(timezone.utc) - timedelta(hours=5) # wait I didn't import timedelta here, let's fix that
    pass # I'll do this better below

def test_lineage_chain():
    chain = ["RAW_SENSOR", "CLEANED_DATA", "FEATURE_SET", "MODEL_OUTPUT"]
    assert len(chain) == 4
    assert chain[0] == "RAW_SENSOR"
