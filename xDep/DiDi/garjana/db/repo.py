"""Database repository for Garjana.

Provides CRUD operations for PostGIS tables.
All provenance metadata is stored alongside data (R2).
"""
from __future__ import annotations

import json
import os
from contextlib import contextmanager
from typing import Generator

import psycopg2
import psycopg2.extras

from core.provenance import observation_to_dict
from core.types import (
    Alert,
    ETAEstimate,
    HazardValue,
    Observation,
    StormObject,
)


def get_db_url() -> str:
    """Get database URL from environment."""
    return os.environ.get(
        "DATABASE_URL",
        "postgresql://garjana:garjana@localhost:5432/garjana"
    )


@contextmanager
def get_connection() -> Generator:
    """Get a database connection."""
    conn = psycopg2.connect(get_db_url())
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Initialize the database with the schema."""
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path) as f:
        sql = f.read()
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)


def insert_observation_meta(obs: Observation) -> None:
    """Insert observation metadata (provenance tracking - R2)."""
    d = observation_to_dict(obs)
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO observations_meta
                   (source, valid_time, received_time, fidelity, qc, meta)
                   VALUES (%s, %s, %s, %s, %s, %s)
                   ON CONFLICT (source, valid_time) DO UPDATE SET
                   received_time = EXCLUDED.received_time,
                   fidelity = EXCLUDED.fidelity,
                   qc = EXCLUDED.qc,
                   meta = EXCLUDED.meta""",
                (d["source"], d["valid_time"], d["received_time"],
                 d["fidelity"], json.dumps(d["qc"]), json.dumps(d["meta"]))
            )


def insert_hazard_forecast(h: HazardValue) -> None:
    """Insert a hazard forecast. Enforces R3: validation_tier required."""
    if h.validation_tier is None:
        raise ValueError("HazardValue MUST have validation_tier (R3)")
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO hazard_forecasts
                   (storm_id, issued, valid_time, lead_min, hazard, value,
                    unit, validation_tier, method_version, oi_mean, geom)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                           ST_GeomFromText(%s, 4326))""",
                (h.storm_id, h.issued, h.valid_time, h.lead_min, h.hazard,
                 h.value, h.unit, h.validation_tier.value, h.method_version,
                 h.oi_summary, h.polygon_wkt)
            )


def insert_alert(a: Alert) -> None:
    """Insert an alert. Always starts as DRAFT (R10)."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO alerts
                   (alert_id, status, hazard, severity, urgency, certainty,
                    validation_tier, issued, expires, geom, cap_xml,
                    languages, approved_by, dismiss_reason, outcome)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s,
                           ST_GeomFromText(%s, 4326), %s, %s, %s, %s, %s)""",
                (a.alert_id, a.status.value, a.hazard,
                 a.severity.value, a.urgency.value, a.certainty.value,
                 a.validation_tier.value, a.issued, a.expires,
                 a.polygon_wkt, a.cap_xml, a.languages,
                 a.approved_by, a.dismiss_reason, a.outcome)
            )


def insert_storm_cell(s: StormObject) -> None:
    """Insert a storm cell observation."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO storm_cells
                   (storm_id, ts, geom, centroid, area_km2, zmax, vil,
                    echo_top_proxy, flash_rate, flash_rate_trend,
                    u_kmh, v_kmh, growth, track_id, lifecycle_event)
                   VALUES (%s, %s, ST_GeomFromText(%s, 4326),
                           ST_SetSRID(ST_MakePoint(%s, %s), 4326),
                           %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (storm_id, ts) DO UPDATE SET
                   geom = EXCLUDED.geom,
                   area_km2 = EXCLUDED.area_km2,
                   zmax = EXCLUDED.zmax""",
                (s.storm_id, s.timestamp, s.polygon_wkt,
                 s.centroid_lon, s.centroid_lat,
                 s.area_km2, s.zmax, s.vil, s.echo_top_proxy,
                 s.flash_rate, s.flash_rate_trend,
                 s.u_kmh, s.v_kmh, s.growth_rate, s.track_id,
                 s.lifecycle_event)
            )


def insert_eta_estimate(e: ETAEstimate) -> None:
    """Insert a probabilistic ETA estimate."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO eta_estimates
                   (storm_id, asset_id, issued, eta_p10, eta_p50, eta_p90,
                    p_impact_60, p_impact_120, n_members_impacting, n_members_total)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON CONFLICT (storm_id, asset_id, issued) DO UPDATE SET
                   eta_p10 = EXCLUDED.eta_p10,
                   eta_p50 = EXCLUDED.eta_p50,
                   eta_p90 = EXCLUDED.eta_p90""",
                (e.storm_id, e.asset_id, e.issued,
                 e.eta_p10_min, e.eta_p50_min, e.eta_p90_min,
                 e.p_impact_60, e.p_impact_120,
                 e.n_members_impacting, e.n_members_total)
            )


def log_mode_transition(
    old_mode: str | None,
    new_mode: str,
    reason: str,
    source_status: dict | None = None,
) -> None:
    """Log a degradation mode transition."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO mode_transitions
                   (old_mode, new_mode, reason, source_status)
                   VALUES (%s, %s, %s, %s)""",
                (old_mode, new_mode, reason,
                 json.dumps(source_status or {}))
            )
