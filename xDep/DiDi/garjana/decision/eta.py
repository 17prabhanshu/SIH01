"""Probabilistic ETA computation.

Not a single number. Reports median, 10-90% interval, and
P(impact within 60/120 min).

R1: Never fabricate ETAs. Every number from computation.
"""
from __future__ import annotations

import datetime

import numpy as np

from core.types import ETAEstimate


def compute_probabilistic_eta(
    storm_id: str,
    asset_id: str,
    member_etas: list[int | None],
    issued: datetime.datetime,
    n_total: int = 8,
) -> ETAEstimate:
    """Compute probabilistic ETA from ensemble members.

    Args:
        storm_id: Storm identifier.
        asset_id: Asset identifier.
        member_etas: ETA in minutes for each ensemble member (None = no impact).
        issued: Issue time.
        n_total: Total ensemble members.

    Returns:
        ETAEstimate with percentiles and impact probabilities.
    """
    valid_etas = [e for e in member_etas if e is not None]
    n_impacting = len(valid_etas)

    if n_impacting == 0:
        return ETAEstimate(
            storm_id=storm_id,
            asset_id=asset_id,
            issued=issued,
            n_members_impacting=0,
            n_members_total=n_total,
        )

    etas = np.array(valid_etas, dtype=float)

    # Percentiles
    p10 = int(np.percentile(etas, 10))
    p50 = int(np.percentile(etas, 50))
    p90 = int(np.percentile(etas, 90))

    # Impact probabilities
    p_60 = float(np.sum(etas <= 60)) / n_total
    p_120 = float(np.sum(etas <= 120)) / n_total

    return ETAEstimate(
        storm_id=storm_id,
        asset_id=asset_id,
        issued=issued,
        eta_p10_min=p10,
        eta_p50_min=p50,
        eta_p90_min=p90,
        p_impact_60=round(p_60, 3),
        p_impact_120=round(p_120, 3),
        n_members_impacting=n_impacting,
        n_members_total=n_total,
    )
