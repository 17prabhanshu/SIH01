"""Pydantic schemas for API request/response models.

Every hazard response MUST include validation_tier (R3).
Every response includes run_mode (R9).
"""
from __future__ import annotations

import datetime

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    run_mode: str
    system_mode: str
    timestamp: str


class ModeResponse(BaseModel):
    run_mode: str
    system_mode: str


class StormSummary(BaseModel):
    storm_id: str
    track_id: str
    centroid_lat: float
    centroid_lon: float
    area_km2: float
    zmax: float
    vil: float
    flash_rate: float
    u_kmh: float
    v_kmh: float
    growth_rate: float
    lifecycle_event: str | None = None
    timestamp: datetime.datetime


class HazardResponse(BaseModel):
    """R3: validation_tier is REQUIRED. API rejects without it."""
    hazard: str
    value: float
    unit: str
    validation_tier: str = Field(
        ...,
        description="REQUIRED (R3). One of: validated, experimental, environment_only, proxy",
    )
    method_version: str
    oi_summary: float
    lead_min: int
    storm_id: str | None = None


class ETAResponse(BaseModel):
    storm_id: str
    asset_id: str
    eta_p10_min: int | None
    eta_p50_min: int | None
    eta_p90_min: int | None
    p_impact_60: float | None
    p_impact_120: float | None
    n_members_impacting: int
    n_members_total: int


class AlertResponse(BaseModel):
    alert_id: str
    status: str
    hazard: str
    severity: str
    urgency: str
    certainty: str
    validation_tier: str
    issued: datetime.datetime | None
    expires: datetime.datetime | None
    languages: list[str]
    approved_by: str | None
    outcome: str | None


class AssetResponse(BaseModel):
    asset_id: str
    kind: str
    name: str | None
    criticality: float


class ObservationMetaResponse(BaseModel):
    source: str
    valid_time: datetime.datetime
    received_time: datetime.datetime
    fidelity: str
    age_minutes: float


class VerificationScoreResponse(BaseModel):
    model: str
    lead_min: int
    metric: str
    threshold: float
    oi_bucket: str
    value: float
    n: int
