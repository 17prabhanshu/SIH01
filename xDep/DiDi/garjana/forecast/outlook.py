"""Environment Outlook (H3, 2-6h).

R17: Index-based (raw GFS/ERA5 convective indices + documented rule in YAML)
until T2. No trained model in T0/T1.

Shows GFS/ERA5 convective indices as clearly-labelled environment layers.
"""
from __future__ import annotations

import numpy as np


def compute_favourability_index(
    cape: np.ndarray | float = 0.0,
    cin: np.ndarray | float = 0.0,
    shear_0_6km: np.ndarray | float = 0.0,
    pwat: np.ndarray | float = 0.0,
    dcape: np.ndarray | float = 0.0,
    lifted_index: np.ndarray | float = 0.0,
) -> np.ndarray | float:
    """Compute convective favourability from environment indices.

    R17: Simple documented rule, not a trained model.
    This is a favourability MAP, not a cell-level forecast.

    Favourability = normalized weighted sum of index contributions.
    Shown with "coarse" hatch to indicate 0.25 deg resolution.
    """
    # Normalize each index to [0, 1] contribution
    cape_val = np.clip(np.asarray(cape) / 3000.0, 0.0, 1.0)  # CAPE / 3000
    cin_val = np.clip(1.0 - np.abs(np.asarray(cin)) / 200.0, 0.0, 1.0)  # Low CIN favorable
    shear_val = np.clip(np.asarray(shear_0_6km) / 30.0, 0.0, 1.0)  # Shear / 30 m/s
    pwat_val = np.clip(np.asarray(pwat) / 60.0, 0.0, 1.0)  # PWAT / 60 mm
    dcape_val = np.clip(np.asarray(dcape) / 1500.0, 0.0, 1.0)  # DCAPE / 1500
    li_val = np.clip((0.0 - np.asarray(lifted_index)) / 8.0, 0.0, 1.0)  # Negative LI

    # Weighted sum (weights are documented constants)
    # source: internal design decision, NEEDS VERIFICATION against literature
    favourability = (
        0.30 * cape_val
        + 0.10 * cin_val
        + 0.15 * shear_val
        + 0.15 * pwat_val
        + 0.15 * dcape_val
        + 0.15 * li_val
    )

    return np.clip(favourability, 0.0, 1.0)
