"""Tests for provenance serialization.

R2: Provenance must round-trip through serialization.
"""
import datetime

from core.provenance import (
    observation_from_dict,
    observation_from_json,
    observation_to_dict,
    observation_to_json,
)
from core.types import Fidelity, Observation


def test_dict_roundtrip():
    now = datetime.datetime.now(datetime.timezone.utc)
    obs = Observation(
        source="radar:LKO",
        valid_time=now - datetime.timedelta(minutes=5),
        received_time=now,
        fidelity=Fidelity.NATIVE,
        qc={"missing_frac": 0.02, "clutter_frac": 0.01},
        meta={"product_id": "CMAX", "file": "test.nc"},
    )
    d = observation_to_dict(obs)
    obs2 = observation_from_dict(d)
    assert obs2.source == obs.source
    assert obs2.fidelity == obs.fidelity
    assert obs2.qc == obs.qc
    assert obs2.meta == obs.meta


def test_json_roundtrip():
    now = datetime.datetime.now(datetime.timezone.utc)
    obs = Observation(
        source="insat3dr:TIR1",
        valid_time=now,
        received_time=now,
        fidelity=Fidelity.DERIVED,
        qc={},
        meta={"channel": "TIR1"},
    )
    json_str = observation_to_json(obs)
    obs2 = observation_from_json(json_str)
    assert obs2.source == obs.source
    assert obs2.fidelity == Fidelity.DERIVED


def test_synthetic_fidelity_preserved():
    """R2: Synthetic fidelity must survive serialization."""
    now = datetime.datetime.now(datetime.timezone.utc)
    obs = Observation(
        source="synthetic:test",
        valid_time=now,
        received_time=now,
        fidelity=Fidelity.SYNTHETIC,
    )
    obs2 = observation_from_json(observation_to_json(obs))
    assert obs2.fidelity == Fidelity.SYNTHETIC
    assert obs2.source == "synthetic:test"
