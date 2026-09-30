"""Provenance tracking for all data in Garjana.

Every array carries source, valid_time, received_time, fidelity, and QC flags.
This module provides serialization/deserialization for Redis and PostGIS.
"""
from __future__ import annotations

import datetime
import json

from core.types import Fidelity, Observation


def observation_to_dict(obs: Observation) -> dict:
    """Serialize an Observation to a JSON-compatible dict (for Redis/PostGIS)."""
    return {
        "source": obs.source,
        "valid_time": obs.valid_time.isoformat(),
        "received_time": obs.received_time.isoformat(),
        "fidelity": obs.fidelity.value,
        "has_grid": obs.grid is not None,
        "has_points": obs.points is not None,
        "qc": obs.qc,
        "meta": obs.meta,
    }


def observation_from_dict(d: dict) -> Observation:
    """Deserialize an Observation from a dict (from Redis/PostGIS)."""
    return Observation(
        source=d["source"],
        valid_time=datetime.datetime.fromisoformat(d["valid_time"]),
        received_time=datetime.datetime.fromisoformat(d["received_time"]),
        fidelity=Fidelity(d["fidelity"]),
        grid=None,  # Grid data stored separately in Zarr
        points=None,  # Point data stored separately
        qc=d.get("qc", {}),
        meta=d.get("meta", {}),
    )


def observation_to_json(obs: Observation) -> str:
    """Serialize to JSON string for Redis Streams."""
    return json.dumps(observation_to_dict(obs))


def observation_from_json(s: str) -> Observation:
    """Deserialize from JSON string (Redis Streams)."""
    return observation_from_dict(json.loads(s))
