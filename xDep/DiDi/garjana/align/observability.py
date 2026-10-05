"""Observability Index computation.

Architecture §3.4: A raster OI in [0,1] per grid cell per cycle.
Components stored separately; never collapsed silently.
This is Garjana's headline differentiator.
"""
from __future__ import annotations

import numpy as np

from core.config import Config
from core.types import GridSpec


def compute_radar_coverage(
    grid_spec: GridSpec,
    radar_range_km: float = 250.0,
) -> np.ndarray:
    """Compute radar coverage component.

    Based on range from radar and lowest-beam height above ground.
    Returns array of shape (ny, nx) in [0, 1].
    """
    ny, nx = grid_spec.ny, grid_spec.nx
    center_y, center_x = ny / 2, nx / 2

    yy, xx = np.mgrid[0:ny, 0:nx]
    distance_pixels = np.sqrt((xx - center_x) ** 2 + (yy - center_y) ** 2)
    distance_km = distance_pixels * grid_spec.dx_m / 1000.0

    # Coverage decreases with range
    coverage = np.clip(1.0 - distance_km / radar_range_km, 0.0, 1.0)
    return coverage.astype(np.float32)


def compute_radar_freshness(
    age_minutes: float | None,
    expected_cadence: float = 10.0,
) -> float:
    """Compute radar freshness component.

    Returns scalar in [0, 1]. 1.0 if fresh, decaying with age.
    """
    if age_minutes is None:
        return 0.0
    return float(np.clip(1.0 - age_minutes / (3.0 * expected_cadence), 0.0, 1.0))


def compute_sat_geometry(
    grid_spec: GridSpec,
    sat_lon: float = 82.0,  # INSAT-3DR nominal longitude
) -> np.ndarray:
    """Compute satellite viewing geometry component.

    Proxy based on distance from sub-satellite point.
    Returns array of shape (ny, nx) in [0, 1].
    """
    from core.grid import make_grid_coords

    lats, lons = make_grid_coords(grid_spec)
    # Simple proxy: cos of viewing angle from sub-sat point
    lat_diff = np.abs(lats)
    lon_diff = np.abs(lons - sat_lon)

    # Viewing zenith angle proxy (simplified)
    vza = np.sqrt(lat_diff ** 2 + lon_diff ** 2)
    geometry = np.clip(1.0 - vza / 80.0, 0.0, 1.0)  # 80 deg max VZA
    return geometry.astype(np.float32)


def compute_ltg_coverage(
    network: str = "proxy",
) -> float:
    """Compute lightning detection coverage component.

    From config; unknown -> 0.0, NOT 1.0.
    """
    try:
        cfg = Config.get("ltg_coverage")
        networks = cfg.get("lightning_networks", {})
        if network in networks:
            return float(networks[network].get("coverage_proxy", 0.0))
    except FileNotFoundError:
        pass
    return 0.0


def compute_observability_index(
    grid_spec: GridSpec,
    radar_age_minutes: float | None = None,
    radar_range_km: float = 250.0,
    ltg_network: str = "proxy",
    beam_blockage: np.ndarray | None = None,
) -> tuple[np.ndarray, dict[str, np.ndarray | float]]:
    """Compute the full Observability Index.

    Returns:
        (oi_composite, components): composite OI raster and dict of components.
    """
    try:
        weights_cfg = Config.get("observability")
        weights = weights_cfg.get("oi_weights", {})
    except FileNotFoundError:
        weights = {
            "radar_coverage": 0.30,
            "radar_freshness": 0.25,
            "sat_geometry": 0.15,
            "ltg_coverage": 0.15,
            "env_resolution": 0.15,
        }

    ny, nx = grid_spec.ny, grid_spec.nx

    # Compute components
    radar_coverage = compute_radar_coverage(grid_spec, radar_range_km)
    if beam_blockage is not None:
        radar_coverage = radar_coverage * (1.0 - beam_blockage)

    radar_freshness_val = compute_radar_freshness(radar_age_minutes)
    radar_freshness = np.full((ny, nx), radar_freshness_val, dtype=np.float32)

    sat_geometry = compute_sat_geometry(grid_spec)

    ltg_val = compute_ltg_coverage(ltg_network)
    ltg_coverage = np.full((ny, nx), ltg_val, dtype=np.float32)

    env_resolution = np.full((ny, nx), 0.5, dtype=np.float32)  # Constant informative

    # Weighted composite
    composite = (
        weights.get("radar_coverage", 0.3) * radar_coverage
        + weights.get("radar_freshness", 0.25) * radar_freshness
        + weights.get("sat_geometry", 0.15) * sat_geometry
        + weights.get("ltg_coverage", 0.15) * ltg_coverage
        + weights.get("env_resolution", 0.15) * env_resolution
    )

    components = {
        "radar_coverage": radar_coverage,
        "radar_freshness": radar_freshness,
        "sat_geometry": sat_geometry,
        "ltg_coverage": ltg_coverage,
        "env_resolution": env_resolution,
    }

    return composite.astype(np.float32), components
