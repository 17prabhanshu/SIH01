"""Garjana FastAPI application.

Serves the nowcasting API with REST and WebSocket endpoints.
Always shows system mode (LIVE/REPLAY/SYNTHETIC) in responses.
"""
from __future__ import annotations

import base64
import datetime
import io
import json
import logging
import os
import time
from pathlib import Path

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.ws import manager, websocket_endpoint
from core.types import RunMode, SystemMode

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Garjana API",
    description="Convective-scale nowcasting system for India (SIH 2026, PS 26084)",
    version="0.1.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_api_websocket_route("/ws/events", websocket_endpoint)

# ---------------------------------------------------------------------------
# In-memory store for last cycle result
# ---------------------------------------------------------------------------
_last_cycle: dict | None = None
_last_storms: list[dict] = []
_last_hazards: list[dict] = []
_last_alerts: list[dict] = []
_last_etas: list[dict] = []
_last_oi: dict | None = None
_last_forecast_frames: list | None = None


def get_run_mode() -> RunMode:
    mode_str = os.environ.get("GARJANA_RUN_MODE", "REPLAY")
    try:
        return RunMode(mode_str)
    except ValueError:
        return RunMode.REPLAY


def get_system_mode() -> SystemMode:
    return SystemMode.BASELINE


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check() -> dict:
    return {
        "status": "healthy",
        "service": "garjana-api",
        "version": "0.1.0",
        "run_mode": get_run_mode().value,
        "system_mode": get_system_mode().value,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "cycle_available": _last_cycle is not None,
    }


@app.get("/modes")
async def get_modes() -> dict:
    return {
        "run_mode": get_run_mode().value,
        "system_mode": get_system_mode().value,
    }


# ---------------------------------------------------------------------------
# Replay: execute a forecast cycle and cache results
# ---------------------------------------------------------------------------
@app.post("/replay/run")
async def replay_run(bundle_name: str = "SEVIR_2018_05_12") -> dict:
    """Execute a forecast cycle using a replay bundle."""
    global _last_cycle, _last_storms, _last_hazards, _last_alerts, _last_etas, _last_oi, _last_forecast_frames

    from replay.bundle import ReplayBundle
    from workers.cycle import run_cycle

    bundle_path = Path(f"data/replay_bundles/{bundle_name}")
    if not bundle_path.exists():
        return {"error": f"Bundle {bundle_name} not found", "available": _list_bundles()}

    bundle = ReplayBundle(bundle_path)
    bundle.load()
    cycle_time = datetime.datetime.now(datetime.timezone.utc)
    if bundle.metadata.get("end_time"):
        try:
            cycle_time = datetime.datetime.fromisoformat(bundle.metadata["end_time"])
        except Exception:
            pass
    
    # Set env so cycle knows which bundle to use
    import os
    os.environ["GARJANA_REPLAY_BUNDLE"] = str(bundle_path)
    result = run_cycle(cycle_time, RunMode.REPLAY)

    _last_cycle = result

    # Extract storms, hazards, alerts from the cycle result
    # The cycle stores counts but we need the actual objects.
    # Re-run detection to cache objects for the API.
    try:
        frames = bundle.get_frames("radar")
        context_frames = np.array(frames[-6:])
        last_frame = context_frames[-1]

        from core.types import GridSpec
        from forecast.motion import estimate_motion_lk, perturb_motion_field
        from forecast.extrapolate import extrapolate_semi_lagrangian
        from objects.segment import segment_storms

        grid_spec = GridSpec(center_lat=26.7, center_lon=80.8)
        motion = estimate_motion_lk(context_frames)
        fcst = extrapolate_semi_lagrangian(last_frame, motion, n_steps=12)

        storms = segment_storms(last_frame, grid_spec, cycle_time, threshold_dbz=30.0)
        _last_storms = [
            {
                "storm_id": s.storm_id,
                "centroid_lat": s.centroid_lat,
                "centroid_lon": s.centroid_lon,
                "area_km2": s.area_km2,
                "zmax": float(s.zmax),
                "timestamp": s.timestamp.isoformat() if s.timestamp else None,
            }
            for s in storms
        ]

        # Store forecast frames as base64 for frontend
        _last_forecast_frames = []
        for i in range(fcst.shape[0]):
            buf = io.BytesIO()
            np.save(buf, fcst[i])
            _last_forecast_frames.append({
                "lead_min": (i + 1) * 10,
                "shape": list(fcst[i].shape),
                "min_dbz": float(np.min(fcst[i])),
                "max_dbz": float(np.max(fcst[i])),
                "mean_dbz": float(np.mean(fcst[i])),
                "data_b64": base64.b64encode(buf.getvalue()).decode(),
            })

        # Hazards from cycle
        from hazards.lightning import compute_lightning_hazard
        from hazards.rain import compute_rain_hazard
        from hazards.extreme_rain import compute_extreme_rain_risk
        from hazards.hail import compute_hail_hazard
        from hazards.wind import compute_wind_hazard
        from hazards.tiers import ValidationTier

        ensemble_motions = perturb_motion_field(motion, n_members=8, std_pixels=2.0)
        ensemble_fcsts = np.array([
            extrapolate_semi_lagrangian(last_frame, em, n_steps=12)
            for em in ensemble_motions
        ])

        hazards_computed = []
        ltg = compute_lightning_hazard(vil=None, flash_rate=0)
        ltg.validation_tier = ValidationTier.PROXY
        hazards_computed.append(ltg)
        rain = compute_rain_hazard(ensemble_fcsts)
        hazards_computed.append(rain)
        ext_rain = compute_extreme_rain_risk(ensemble_fcsts)
        ext_rain.validation_tier = ValidationTier.EXPERIMENTAL
        hazards_computed.append(ext_rain)
        hail = compute_hail_hazard(vil=1.0)
        hail.validation_tier = ValidationTier.EXPERIMENTAL
        hazards_computed.append(hail)
        wind = compute_wind_hazard(dcape=0.0)
        wind.validation_tier = ValidationTier.EXPERIMENTAL
        hazards_computed.append(wind)

        _last_hazards = [
            {
                "hazard": h.hazard,
                "value": float(h.value),
                "unit": h.unit,
                "validation_tier": h.validation_tier.value if h.validation_tier else "unknown",
            }
            for h in hazards_computed
        ]

        # Alerts
        import uuid
        from core.types import Alert, AlertStatus
        _last_alerts = [
            {
                "alert_id": f"A{uuid.uuid4().hex[:8]}",
                "hazard": h.hazard,
                "validation_tier": h.validation_tier.value if h.validation_tier else "unknown",
                "status": "draft",
                "issued": cycle_time.isoformat(),
            }
            for h in hazards_computed
        ]

        # OI
        from align.observability import compute_observability_index
        oi_composite, oi_components = compute_observability_index(grid_spec, radar_age_minutes=0.0)
        _last_oi = {
            "composite": float(np.mean(oi_composite)),
            "components": {k: float(np.mean(v)) for k, v in oi_components.items()},
        }

    except Exception as e:
        logger.error(f"Post-cycle extraction error: {e}", exc_info=True)

    # Broadcast via WebSocket
    try:
        import asyncio
        asyncio.create_task(manager.broadcast("cycle.complete", {
            "cycle_time": result.get("cycle_time"),
            "status": result.get("status"),
            "num_storms": len(_last_storms),
            "num_hazards": len(_last_hazards),
        }))
    except Exception:
        pass

    return {
        "status": result.get("status"),
        "cycle_time": result.get("cycle_time"),
        "elapsed_seconds": result.get("elapsed_seconds"),
        "steps": result.get("steps"),
        "num_storms": len(_last_storms),
        "num_hazards": len(_last_hazards),
        "num_alerts": len(_last_alerts),
        "run_mode": get_run_mode().value,
    }


@app.get("/replay/latest")
async def replay_latest() -> dict:
    if _last_cycle is None:
        return {"status": "no_cycle_run", "run_mode": get_run_mode().value}
    return {**_last_cycle, "run_mode": get_run_mode().value}


@app.get("/replay/bundles")
async def replay_bundles() -> dict:
    return {"bundles": _list_bundles(), "run_mode": get_run_mode().value}


def _list_bundles() -> list[str]:
    bundle_dir = Path("data/replay_bundles")
    if not bundle_dir.exists():
        return []
    return [d.name for d in bundle_dir.iterdir() if d.is_dir()]


# ---------------------------------------------------------------------------
# Storm endpoints (live from last cycle)
# ---------------------------------------------------------------------------
@app.get("/storms")
async def list_storms() -> dict:
    return {"storms": _last_storms, "count": len(_last_storms), "run_mode": get_run_mode().value}


@app.get("/storms/{storm_id}")
async def get_storm(storm_id: str) -> dict:
    for s in _last_storms:
        if s["storm_id"] == storm_id:
            return {**s, "run_mode": get_run_mode().value}
    return {"error": "storm not found", "storm_id": storm_id}


# ---------------------------------------------------------------------------
# Hazard endpoints
# ---------------------------------------------------------------------------
@app.get("/hazards")
async def list_hazards(lead: int | None = None) -> dict:
    return {"hazards": _last_hazards, "count": len(_last_hazards), "run_mode": get_run_mode().value}


# ---------------------------------------------------------------------------
# ETA
# ---------------------------------------------------------------------------
@app.get("/eta")
async def get_eta() -> dict:
    return {"estimates": _last_etas, "run_mode": get_run_mode().value}


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------
@app.get("/alerts")
async def list_alerts() -> dict:
    return {"alerts": _last_alerts, "count": len(_last_alerts), "run_mode": get_run_mode().value}


@app.post("/alerts/{alert_id}/approve")
async def approve_alert(alert_id: str, approved_by: str = "forecaster") -> dict:
    for a in _last_alerts:
        if a["alert_id"] == alert_id:
            a["status"] = "approved"
            a["approved_by"] = approved_by
            return {**a, "run_mode": get_run_mode().value}
    return {"error": "alert not found", "alert_id": alert_id}


@app.post("/alerts/{alert_id}/dismiss")
async def dismiss_alert(alert_id: str, reason: str = "") -> dict:
    for a in _last_alerts:
        if a["alert_id"] == alert_id:
            a["status"] = "dismissed"
            a["dismiss_reason"] = reason
            return {**a, "run_mode": get_run_mode().value}
    return {"error": "alert not found", "alert_id": alert_id}


# ---------------------------------------------------------------------------
# Observability Index
# ---------------------------------------------------------------------------
@app.get("/oi")
async def get_observability() -> dict:
    if _last_oi is None:
        return {"oi": None, "status": "no_cycle_run", "run_mode": get_run_mode().value}
    return {"oi": _last_oi, "run_mode": get_run_mode().value}


# ---------------------------------------------------------------------------
# Data Health
# ---------------------------------------------------------------------------
@app.get("/data-health")
async def data_health() -> dict:
    sources = []
    if _last_cycle:
        sources = [
            {"source": "radar", "status": "available" if _last_cycle.get("steps", {}).get("ingest") == "ok" else "unavailable", "fidelity": "synthetic"},
            {"source": "insat", "status": "available", "fidelity": "synthetic"},
            {"source": "lightning", "status": "unavailable", "fidelity": "proxy"},
            {"source": "nwp", "status": "unavailable", "fidelity": "proxy"},
        ]
    return {"sources": sources, "run_mode": get_run_mode().value}


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------
@app.get("/verification")
async def get_verification() -> dict:
    baselines_path = Path("eval/baselines.json")
    if baselines_path.exists():
        with open(baselines_path) as f:
            data = json.load(f)
        return {"scores": data, "run_mode": get_run_mode().value}
    return {"scores": {}, "status": "no_evaluation_run", "run_mode": get_run_mode().value}


# ---------------------------------------------------------------------------
# Forecast frames
# ---------------------------------------------------------------------------
@app.get("/forecast/frames")
async def get_forecast_frames() -> dict:
    if not _last_forecast_frames:
        return {"frames": [], "status": "no_cycle_run", "run_mode": get_run_mode().value}
    # Return metadata only (no huge base64 blobs unless requested)
    summary = [
        {k: v for k, v in f.items() if k != "data_b64"}
        for f in _last_forecast_frames
    ]
    return {"frames": summary, "run_mode": get_run_mode().value}


@app.get("/forecast/frames/{lead_min}")
async def get_forecast_frame(lead_min: int) -> dict:
    if not _last_forecast_frames:
        return {"error": "no_cycle_run"}
    for f in _last_forecast_frames:
        if f["lead_min"] == lead_min:
            return {**f, "run_mode": get_run_mode().value}
    return {"error": f"lead_min {lead_min} not found"}


# ---------------------------------------------------------------------------
# Legacy stubs
# ---------------------------------------------------------------------------
@app.get("/assets")
async def list_assets() -> dict:
    return {"assets": [], "run_mode": get_run_mode().value}


@app.get("/replay/{event_id}/start")
async def replay_start(event_id: str) -> dict:
    return {"event_id": event_id, "status": "use POST /replay/run instead"}


@app.get("/replay/{event_id}/pause")
async def replay_pause(event_id: str) -> dict:
    return {"event_id": event_id, "status": "not_implemented"}


@app.get("/replay/{event_id}/seek")
async def replay_seek(event_id: str, time: str = "") -> dict:
    return {"event_id": event_id, "seek_to": time, "status": "not_implemented"}
