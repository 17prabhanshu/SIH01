"""Replay clock service.

In replay mode, emits historical frames as if live.
R9: REPLAY banner is mandatory in the UI at all times during replay.
"""
from __future__ import annotations

import datetime
import time as time_module

from core.time import CYCLE_MINUTES, align_to_cycle


class ReplayClock:
    """Clock that simulates time for replay mode.

    Emits historical timestamps at the configured speed.
    The UI must show 'REPLAY — <event_id> — <sim_time>' banner (R9).
    """

    def __init__(
        self,
        start_time: datetime.datetime,
        end_time: datetime.datetime,
        event_id: str = "unknown",
        speed: float = 1.0,
    ) -> None:
        self.start_time = align_to_cycle(start_time)
        self.end_time = align_to_cycle(end_time)
        self.event_id = event_id
        self.speed = speed
        self._current_time = self.start_time
        self._paused = False
        self._wall_start: float | None = None

    @property
    def current_time(self) -> datetime.datetime:
        return self._current_time

    @property
    def is_finished(self) -> bool:
        return self._current_time >= self.end_time

    @property
    def is_paused(self) -> bool:
        return self._paused

    def start(self) -> None:
        """Start the replay clock."""
        self._wall_start = time_module.monotonic()
        self._paused = False

    def pause(self) -> None:
        """Pause the replay clock."""
        self._paused = True

    def resume(self) -> None:
        """Resume the replay clock."""
        self._paused = False

    def seek(self, target_time: datetime.datetime) -> None:
        """Seek to a specific time."""
        self._current_time = align_to_cycle(target_time)

    def advance(self) -> datetime.datetime:
        """Advance to the next cycle time.

        Returns the new current time.
        """
        if self._paused or self.is_finished:
            return self._current_time

        self._current_time += datetime.timedelta(minutes=CYCLE_MINUTES)
        if self._current_time > self.end_time:
            self._current_time = self.end_time

        return self._current_time

    def banner(self) -> str:
        """Generate the replay banner text (R9)."""
        status = "PAUSED" if self._paused else "RUNNING"
        return (
            f"REPLAY \u2014 {self.event_id} \u2014 "
            f"{self._current_time.strftime('%Y-%m-%d %H:%M UTC')} "
            f"[{status}]"
        )
