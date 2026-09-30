"""Garjana FastAPI application.

Serves the nowcasting API with REST and WebSocket endpoints.
Always shows system mode (LIVE/REPLAY/SYNTHETIC) in responses.
"""
from __future__ import annotations

import datetime
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.ws import websocket_endpoint
from core.types import RunMode, SystemMode

app = FastAPI(
    title="Garjana API",
    description="Convective-scale nowcasting system for India (SIH 2026, PS 26084)",
    version="0.1.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_api_websocket_route("/ws/events", websocket_endpoint)

def get_run_mode() -> RunMode:
    """Get current run mode from environment."""
    mode_str = os.environ.get("GARJANA_RUN_MODE", "REPLAY")
    try:
        return RunMode(mode_str)
    except ValueError:
        return RunMode.REPLAY


def get_system_mode() -> SystemMode:
    """Get current system mode. In a full system, this comes from the mode manager."""
    # TODO: Read from mode manager / Redis state
    return SystemMode.BASELINE


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint.

    Returns system status including run mode (R9: LIVE/REPLAY/SYNTHETIC banner).
    """
    return {
        "status": "healthy",
        "service": "garjana-api",
        "version": "0.1.0",
        "run_mode": get_run_mode().value,
        "system_mode": get_system_mode().value,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


@app.get("/modes")
async def get_modes() -> dict:
    """Get current system and run modes."""
    return {
        "run_mode": get_run_mode().value,
        "system_mode": get_system_mode().value,
    }


@app.get("/storms")
async def list_storms() -> dict:
    """List active storm cells."""
    # TODO: Implement with PostGIS query
    return {"storms": [], "count": 0, "run_mode": get_run_mode().value}


@app.get("/storms/{storm_id}")
async def get_storm(storm_id: str) -> dict:
    """Get details for a specific storm."""
    # TODO: Implement with PostGIS query
    return {"storm_id": storm_id, "detail": "not_implemented"}


@app.get("/hazards")
async def list_hazards(lead: int | None = None) -> dict:
    """List hazard forecasts. Every hazard MUST have validation_tier (R3)."""
    # TODO: Implement
    return {"hazards": [], "lead_min": lead, "run_mode": get_run_mode().value}


@app.get("/eta")
async def get_eta() -> dict:
    """Get ETA estimates."""
    # TODO: Implement
    return {"estimates": []}


@app.get("/assets")
async def list_assets() -> dict:
    """List exposure assets."""
    # TODO: Implement
    return {"assets": []}


@app.get("/alerts")
async def list_alerts() -> dict:
    """List alerts."""
    # TODO: Implement
    return {"alerts": []}


@app.post("/alerts/{alert_id}/approve")
async def approve_alert(alert_id: str, approved_by: str = "forecaster") -> dict:
    """Approve a draft alert (R10: human approval required)."""
    # TODO: Implement
    return {"alert_id": alert_id, "status": "not_implemented"}


@app.post("/alerts/{alert_id}/dismiss")
async def dismiss_alert(alert_id: str, reason: str = "") -> dict:
    """Dismiss a draft alert with reason."""
    # TODO: Implement
    return {"alert_id": alert_id, "status": "not_implemented"}


@app.get("/verification")
async def get_verification() -> dict:
    """Get verification scores."""
    # TODO: Implement
    return {"scores": []}


@app.get("/data-health")
async def data_health() -> dict:
    """Get per-source data health status."""
    # TODO: Implement
    return {"sources": [], "run_mode": get_run_mode().value}


@app.get("/oi")
async def get_observability() -> dict:
    """Get Observability Index."""
    # TODO: Implement
    return {"oi": None}


@app.get("/replay/{event_id}/start")
async def replay_start(event_id: str) -> dict:
    """Start replaying an event."""
    # TODO: Implement
    return {"event_id": event_id, "status": "not_implemented"}


@app.get("/replay/{event_id}/pause")
async def replay_pause(event_id: str) -> dict:
    """Pause replay."""
    return {"event_id": event_id, "status": "not_implemented"}


@app.get("/replay/{event_id}/seek")
async def replay_seek(event_id: str, time: str = "") -> dict:
    """Seek to a specific time in replay."""
    return {"event_id": event_id, "seek_to": time, "status": "not_implemented"}
