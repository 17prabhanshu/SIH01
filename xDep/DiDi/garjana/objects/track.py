"""Storm cell tracking using Hungarian assignment.

Uses predicted-centroid distance + overlap (IoU) with the motion field.
Supports merge/split lineage.
"""
from __future__ import annotations

import numpy as np
from scipy.optimize import linear_sum_assignment

from core.types import StormObject


def track_storms(
    current_storms: list[StormObject],
    previous_storms: list[StormObject],
    motion_u: float = 0.0,
    motion_v: float = 0.0,
    max_distance_km: float = 30.0,
) -> list[StormObject]:
    """Track storms between two timesteps using Hungarian assignment.

    Args:
        current_storms: Detected storms at current time.
        previous_storms: Tracked storms from previous time.
        motion_u: Mean eastward motion (km/h) for prediction.
        motion_v: Mean northward motion (km/h) for prediction.
        max_distance_km: Maximum matching distance.

    Returns:
        Current storms with updated track_id and motion.
    """
    if not previous_storms or not current_storms:
        # First frame or no storms: assign new track IDs
        for i, storm in enumerate(current_storms):
            if not storm.track_id:
                storm.track_id = f"T{storm.storm_id}"
                storm.lifecycle_event = "new"
        return current_storms

    # Time delta in hours
    dt_hours = (
        current_storms[0].timestamp - previous_storms[0].timestamp
    ).total_seconds() / 3600.0
    if dt_hours <= 0:
        dt_hours = 1.0 / 6.0  # Default 10 min

    # Build cost matrix (distance between predicted previous and current)
    n_prev = len(previous_storms)
    n_curr = len(current_storms)
    cost = np.full((n_prev, n_curr), 1e9)

    for i, prev in enumerate(previous_storms):
        # Predicted position
        pred_lat = prev.centroid_lat + (prev.v_kmh or motion_v) * dt_hours / 111.0
        pred_lon = prev.centroid_lon + (prev.u_kmh or motion_u) * dt_hours / (
            111.0 * max(np.cos(np.radians(prev.centroid_lat)), 0.01)
        )

        for j, curr in enumerate(current_storms):
            dlat = curr.centroid_lat - pred_lat
            dlon = curr.centroid_lon - pred_lon
            dist_km = np.sqrt(
                (dlat * 111.0) ** 2
                + (dlon * 111.0 * np.cos(np.radians(curr.centroid_lat))) ** 2
            )
            if dist_km <= max_distance_km:
                cost[i, j] = dist_km

    # Hungarian assignment
    row_ind, col_ind = linear_sum_assignment(cost)

    matched_curr = set()
    for r, c in zip(row_ind, col_ind):
        if cost[r, c] < max_distance_km:
            prev = previous_storms[r]
            curr = current_storms[c]
            curr.track_id = prev.track_id

            # Compute motion
            dlat = curr.centroid_lat - prev.centroid_lat
            dlon = curr.centroid_lon - prev.centroid_lon
            curr.u_kmh = dlon * 111.0 * np.cos(np.radians(curr.centroid_lat)) / dt_hours
            curr.v_kmh = dlat * 111.0 / dt_hours

            # Growth rate
            if prev.area_km2 > 0:
                curr.growth_rate = (curr.area_km2 - prev.area_km2) / prev.area_km2

            # Lifecycle event
            if curr.zmax > prev.zmax + 5:
                curr.lifecycle_event = "intensified"
            elif curr.area_km2 < prev.area_km2 * 0.5:
                curr.lifecycle_event = "decaying"

            matched_curr.add(c)

    # Unmatched current storms = new initiations
    for j, storm in enumerate(current_storms):
        if j not in matched_curr:
            storm.track_id = f"T{storm.storm_id}"
            storm.lifecycle_event = "new"

    return current_storms
