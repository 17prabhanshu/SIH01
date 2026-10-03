"""Storm cell segmentation.

Threshold + connected components on composite reflectivity.
Config-driven thresholds from config/thresholds.yaml.
"""
from __future__ import annotations

import datetime
import uuid

import numpy as np
from scipy import ndimage

from core.config import Config
from core.types import GridSpec, StormObject


def segment_storms(
    reflectivity: np.ndarray,
    grid_spec: GridSpec,
    timestamp: datetime.datetime,
    threshold_dbz: float | None = None,
    min_area_km2: float | None = None,
) -> list[StormObject]:
    """Segment storm cells from a reflectivity field.

    Args:
        reflectivity: 2D reflectivity field (ny, nx) in dBZ.
        grid_spec: Grid specification.
        timestamp: Valid time of the field.
        threshold_dbz: Detection threshold. If None, from config.
        min_area_km2: Minimum area. If None, from config.

    Returns:
        List of StormObject instances.
    """
    if threshold_dbz is None or min_area_km2 is None:
        try:
            cfg = Config.get("thresholds")
            seg_cfg = cfg.get("segmentation", {})
            if threshold_dbz is None:
                threshold_dbz = seg_cfg.get("reflectivity_dbz", {}).get("detection", 30.0)
            if min_area_km2 is None:
                min_area_km2 = seg_cfg.get("min_area_km2", 16.0)
        except FileNotFoundError:
            threshold_dbz = threshold_dbz or 30.0
            min_area_km2 = min_area_km2 or 16.0

    # Apply a slight Gaussian blur to remove salt-and-pepper radar noise
    # Real storms are contiguous; noise will be smoothed below threshold.
    smoothed = ndimage.gaussian_filter(reflectivity, sigma=1.0)
    
    # Binary mask
    binary = smoothed >= threshold_dbz

    # Connected components
    labeled, n_features = ndimage.label(binary)

    # Cell area in km^2
    cell_area_km2 = (grid_spec.dx_m / 1000.0) * (grid_spec.dy_m / 1000.0)

    storms: list[StormObject] = []
    for label_id in range(1, n_features + 1):
        mask = labeled == label_id
        pixel_count = int(mask.sum())
        area_km2 = pixel_count * cell_area_km2

        if area_km2 < min_area_km2:
            continue

        # Properties
        cell_pixels = reflectivity[mask]
        zmax = float(cell_pixels.max())

        # VIL proxy (simple column integral approximation)
        vil = float(cell_pixels.mean()) * 0.1  # Simplified proxy

        # Centroid (in grid coordinates -> approximate lat/lon)
        cy, cx = ndimage.center_of_mass(mask)
        # Convert to lat/lon using grid center + offset
        lat = grid_spec.center_lat + (cy - grid_spec.ny / 2) * grid_spec.dy_m / 111000.0
        lon = grid_spec.center_lon + (cx - grid_spec.nx / 2) * grid_spec.dx_m / (111000.0 * np.cos(np.radians(grid_spec.center_lat)))

        # Bounding polygon (convex hull of mask)
        polygon_wkt = _mask_to_polygon_wkt(mask, grid_spec)

        storm = StormObject(
            storm_id=f"S{uuid.uuid4().hex[:8]}",
            track_id="",  # Assigned by tracker
            timestamp=timestamp,
            centroid_lat=float(lat),
            centroid_lon=float(lon),
            area_km2=area_km2,
            zmax=zmax,
            vil=vil,
            polygon_wkt=polygon_wkt,
        )
        storms.append(storm)

    return storms


def _mask_to_polygon_wkt(
    mask: np.ndarray,
    grid_spec: GridSpec,
) -> str | None:
    """Convert a binary mask to a WKT polygon (concave footprint)."""
    try:
        from skimage import measure

        contours = measure.find_contours(mask, 0.5)
        if not contours:
            return None

        # Take the largest contour by area or simply the one with most points
        contour = max(contours, key=len)

        if len(contour) < 3:
            return None

        ys = contour[:, 0]
        xs = contour[:, 1]

        # Convert to lat/lon
        lats = grid_spec.center_lat + (ys - grid_spec.ny / 2) * grid_spec.dy_m / 111000.0
        lons = grid_spec.center_lon + (xs - grid_spec.nx / 2) * grid_spec.dx_m / (
            111000.0 * np.cos(np.radians(grid_spec.center_lat))
        )

        contour_points = np.column_stack([lons, lats])
        
        # Close the ring if not closed
        if not np.allclose(contour_points[0], contour_points[-1]):
            contour_points = np.vstack([contour_points, contour_points[0]])

        coords = ", ".join(f"{lon} {lat}" for lon, lat in contour_points)
        return f"POLYGON(({coords}))"
    except Exception:
        return None
