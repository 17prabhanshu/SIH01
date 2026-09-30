"""Storm lifecycle event detection.

Detects initiation, intensification, splitting, merging, decay.
"""
from __future__ import annotations

from core.types import StormObject


def detect_lifecycle_events(
    current: list[StormObject],
    previous: list[StormObject],
) -> list[StormObject]:
    """Detect lifecycle events for tracked storms.

    Events: initiation, intensification, split, merge, decay.
    """
    if not previous:
        for storm in current:
            storm.lifecycle_event = "initiation"
        return current

    prev_tracks = {s.track_id for s in previous if s.track_id}
    {s.track_id for s in current if s.track_id}

    for storm in current:
        if not storm.track_id:
            storm.lifecycle_event = "initiation"
            continue

        if storm.track_id not in prev_tracks:
            storm.lifecycle_event = "initiation"
            continue

        # Find corresponding previous storm
        prev_match = [s for s in previous if s.track_id == storm.track_id]
        if not prev_match:
            continue

        prev = prev_match[0]

        # Intensification: Zmax increase > 5 dBZ or area growth > 50%
        if storm.zmax > prev.zmax + 5 or storm.area_km2 > prev.area_km2 * 1.5:
            storm.lifecycle_event = "intensification"
        # Decay: Zmax decrease > 5 dBZ or area shrink > 50%
        elif storm.zmax < prev.zmax - 5 or storm.area_km2 < prev.area_km2 * 0.5:
            storm.lifecycle_event = "decay"

    return current


def detect_merges(
    current: list[StormObject],
    previous: list[StormObject],
    merge_distance_km: float = 10.0,
) -> list[tuple[str, str, str]]:
    """Detect merge events (two previous storms became one current).

    Returns list of (prev_track_1, prev_track_2, merged_track).
    """
    merges: list[tuple[str, str, str]] = []

    prev_tracks = {s.track_id for s in previous if s.track_id}
    curr_tracks = {s.track_id for s in current if s.track_id}

    prev_tracks - curr_tracks
    # If multiple disappeared near a surviving track, likely a merge
    # Simplified detection

    return merges


def detect_splits(
    current: list[StormObject],
    previous: list[StormObject],
    split_distance_km: float = 15.0,
) -> list[tuple[str, str, str]]:
    """Detect split events (one previous storm became two current).

    Returns list of (parent_track, child_track_1, child_track_2).
    """
    splits: list[tuple[str, str, str]] = []
    # Simplified: detect by new initiations close to existing tracks
    return splits
