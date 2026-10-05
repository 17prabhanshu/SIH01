"""Replay bundle builder and loader.

A replay bundle is a self-contained package of pre-computed data:
frames, features, forecasts, ensembles, PostGIS fixtures.
The demo runs exclusively from this bundle with NO internet.
"""
from __future__ import annotations

import datetime
import json
from pathlib import Path
from typing import Any

import numpy as np


class ReplayBundle:
    """Self-contained replay bundle for offline demo.

    Contains:
    - Observation frames (radar, satellite, lightning)
    - Pre-computed forecasts and ensembles
    - PostGIS fixtures (storm cells, hazards, alerts)
    - Metadata and provenance
    """

    def __init__(self, bundle_dir: str | Path) -> None:
        self.bundle_dir = Path(bundle_dir)
        self._metadata: dict[str, Any] = {}
        self._frames: dict[str, list[np.ndarray]] = {}
        self._fixtures: dict[str, list[dict]] = {}

    def exists(self) -> bool:
        return self.bundle_dir.exists()

    def load(self) -> None:
        """Load the bundle from disk."""
        meta_path = self.bundle_dir / "metadata.json"
        if meta_path.exists():
            with open(meta_path) as f:
                self._metadata = json.load(f)

    def save(self) -> None:
        """Save the bundle to disk."""
        self.bundle_dir.mkdir(parents=True, exist_ok=True)

        # Save metadata
        with open(self.bundle_dir / "metadata.json", "w") as f:
            json.dump(self._metadata, f, indent=2, default=str)

        # Save frames as numpy files
        for source, frames in self._frames.items():
            source_dir = self.bundle_dir / "frames" / source
            source_dir.mkdir(parents=True, exist_ok=True)
            for i, frame in enumerate(frames):
                np.save(source_dir / f"frame_{i:04d}.npy", frame)

        # Save fixtures as JSON
        for table, records in self._fixtures.items():
            fixtures_dir = self.bundle_dir / "fixtures"
            fixtures_dir.mkdir(parents=True, exist_ok=True)
            with open(fixtures_dir / f"{table}.json", "w") as f:
                json.dump(records, f, indent=2, default=str)

    @property
    def metadata(self) -> dict[str, Any]:
        return self._metadata

    def set_metadata(
        self,
        event_id: str,
        start_time: datetime.datetime,
        end_time: datetime.datetime,
        domain: str,
        sources: list[str],
        fidelity: str,
    ) -> None:
        """Set bundle metadata."""
        self._metadata = {
            "event_id": event_id,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "domain": domain,
            "sources": sources,
            "fidelity": fidelity,
            "created": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "garjana_version": "0.1.0",
        }

    def add_frames(self, source: str, frames: list[np.ndarray]) -> None:
        """Add observation frames for a source."""
        self._frames[source] = frames

    def get_frames(self, source: str) -> list[np.ndarray]:
        """Get frames for a source, loading from disk if needed."""
        if source in self._frames:
            return self._frames[source]

        source_dir = self.bundle_dir / "frames" / source
        if not source_dir.exists():
            return []

        frames = []
        for frame_path in sorted(source_dir.glob("frame_*.npy")):
            frames.append(np.load(frame_path))

        self._frames[source] = frames
        return frames

    def add_fixtures(self, table: str, records: list[dict]) -> None:
        """Add PostGIS fixture data."""
        self._fixtures[table] = records

    def get_fixtures(self, table: str) -> list[dict]:
        """Get fixture data for a table."""
        if table in self._fixtures:
            return self._fixtures[table]

        fixtures_path = self.bundle_dir / "fixtures" / f"{table}.json"
        if fixtures_path.exists():
            with open(fixtures_path) as f:
                self._fixtures[table] = json.load(f)
            return self._fixtures[table]

        return []
