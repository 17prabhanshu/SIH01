"""Base provider contract for all data sources.

Architecture §3.3: Provider pattern everywhere. Every source is a pluggable
adapter with the same contract and an explicit fidelity flag.
"""
from __future__ import annotations

import abc
import datetime
from typing import Any

from core.types import Fidelity, GridSpec, Observation


class BaseProvider(abc.ABC):
    """Abstract base class for all data providers.

    Every provider must:
    1. Return Observation objects with full provenance (R2)
    2. Set fidelity correctly (native/derived/proxy/synthetic)
    3. Never fabricate data (R1)
    4. Handle missing data gracefully (return None, not fake data)
    """

    def __init__(self, provider_id: str, fidelity: Fidelity) -> None:
        self.provider_id = provider_id
        self.fidelity = fidelity
        self._last_valid_time: datetime.datetime | None = None

    @abc.abstractmethod
    def fetch(
        self,
        valid_time: datetime.datetime,
        grid_spec: GridSpec,
    ) -> Observation | None:
        """Fetch observation for the given time and grid.

        Returns None if data is unavailable. Never fabricates data (R1).
        """
        ...

    @abc.abstractmethod
    def is_available(self) -> bool:
        """Check if this provider can currently serve data."""
        ...

    @property
    def source_name(self) -> str:
        """Full source identifier, e.g. 'radar:LKO'."""
        return self.provider_id

    @property
    def last_valid_time(self) -> datetime.datetime | None:
        """Time of the most recent valid observation."""
        return self._last_valid_time

    def age_minutes(self, now: datetime.datetime) -> float | None:
        """Minutes since last valid observation."""
        if self._last_valid_time is None:
            return None
        return (now - self._last_valid_time).total_seconds() / 60.0

    def _make_observation(
        self,
        valid_time: datetime.datetime,
        grid: Any | None = None,
        points: Any | None = None,
        qc: dict | None = None,
        meta: dict | None = None,
    ) -> Observation:
        """Helper to create an Observation with correct provenance."""
        now = datetime.datetime.now(datetime.timezone.utc)
        self._last_valid_time = valid_time
        return Observation(
            source=self.source_name,
            valid_time=valid_time,
            received_time=now,
            fidelity=self.fidelity,
            grid=grid,
            points=points,
            qc=qc or {},
            meta=meta or {},
        )
