from __future__ import annotations

import datetime
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

import numpy as np


class Fidelity(str, Enum):
    NATIVE = "native"
    DERIVED = "derived"
    PROXY = "proxy"
    SYNTHETIC = "synthetic"

class ValidationTier(str, Enum):
    VALIDATED = "validated"
    EXPERIMENTAL = "experimental"
    ENVIRONMENT_ONLY = "environment_only"
    PROXY = "proxy"

class SystemMode(str, Enum):
    FULL = "FULL"
    NO_LIGHTNING = "NO_LIGHTNING"
    RADAR_SAT = "RADAR_SAT"
    RADAR_ONLY = "RADAR_ONLY"
    SAT_ONLY = "SAT_ONLY"
    BASELINE = "BASELINE"

class RunMode(str, Enum):
    LIVE = "LIVE"
    REPLAY = "REPLAY"
    SYNTHETIC = "SYNTHETIC"

class AlertStatus(str, Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    ISSUED = "issued"
    DISMISSED = "dismissed"
    EXPIRED = "expired"

class AlertSeverity(str, Enum):
    EXTREME = "Extreme"
    SEVERE = "Severe"
    MODERATE = "Moderate"
    MINOR = "Minor"
    UNKNOWN = "Unknown"

class AlertUrgency(str, Enum):
    IMMEDIATE = "Immediate"
    EXPECTED = "Expected"
    FUTURE = "Future"
    PAST = "Past"
    UNKNOWN = "Unknown"

class AlertCertainty(str, Enum):
    OBSERVED = "Observed"
    LIKELY = "Likely"
    POSSIBLE = "Possible"
    UNLIKELY = "Unlikely"
    UNKNOWN = "Unknown"

@dataclass
class GridSpec:
    """Specification for the 2 km analysis grid."""
    center_lat: float
    center_lon: float
    nx: int = 256
    ny: int = 256
    dx_m: float = 2000.0
    dy_m: float = 2000.0
    projection: str = "aeqd"  # azimuthal equidistant
    radar_id: str = ""

@dataclass
class Observation:
    """A single observation from any provider.

    Every data array in Garjana carries provenance: source, valid_time,
    received_time, fidelity, and QC flags. This is non-negotiable (R2).
    """
    source: str                    # e.g. "radar:LKO", "insat3dr:TIR1"
    valid_time: datetime.datetime  # UTC, time the measurement describes
    received_time: datetime.datetime  # UTC, when we got it
    fidelity: Fidelity
    grid: np.ndarray | None = None  # on the domain grid, or None for point data
    points: Any | None = None       # GeoDataFrame for point data
    qc: dict[str, Any] = field(default_factory=dict)
    meta: dict[str, Any] = field(default_factory=dict)

    @property
    def age_minutes(self) -> float:
        """Minutes between valid_time and received_time."""
        return (self.received_time - self.valid_time).total_seconds() / 60.0

    @property
    def is_synthetic(self) -> bool:
        return self.fidelity == Fidelity.SYNTHETIC

@dataclass
class StormObject:
    """A tracked storm cell at a single timestep."""
    storm_id: str
    track_id: str
    timestamp: datetime.datetime
    centroid_lat: float
    centroid_lon: float
    area_km2: float
    zmax: float                    # max reflectivity (dBZ)
    vil: float                     # VIL (kg/m^2)
    echo_top_proxy: float | None = None  # km
    flash_rate: float = 0.0        # flashes/min
    flash_rate_trend: float = 0.0  # flashes/min change
    u_kmh: float = 0.0             # motion east (km/h)
    v_kmh: float = 0.0             # motion north (km/h)
    growth_rate: float = 0.0       # area change rate
    polygon_wkt: str | None = None
    lifecycle_event: str | None = None  # initiation/intensification/split/merge/decay

@dataclass
class HazardValue:
    """A single hazard output. MUST carry validation_tier (R3)."""
    hazard: str                    # lightning/heavy_rain/extreme_rain/hail/wind
    value: float
    unit: str
    validation_tier: ValidationTier  # REQUIRED — API rejects without this
    method_version: str
    oi_summary: float              # Observability Index for this area
    lead_min: int
    storm_id: str | None = None
    issued: datetime.datetime | None = None
    valid_time: datetime.datetime | None = None
    polygon_wkt: str | None = None

    def __post_init__(self):
        """Enforce R3: every hazard must have a validation tier."""
        if self.validation_tier is None:
            raise ValueError(
                "HazardValue MUST have a validation_tier (R3). "
                "This is a non-negotiable rule."
            )

@dataclass
class ETAEstimate:
    """Probabilistic ETA for a storm impacting an asset."""
    storm_id: str
    asset_id: str
    issued: datetime.datetime
    eta_p10_min: int | None = None   # 10th percentile
    eta_p50_min: int | None = None   # median
    eta_p90_min: int | None = None   # 90th percentile
    p_impact_60: float | None = None  # P(impact within 60 min)
    p_impact_120: float | None = None # P(impact within 120 min)
    n_members_impacting: int = 0
    n_members_total: int = 8

@dataclass
class Alert:
    """A CAP-style alert. Always starts as DRAFT (R10)."""
    alert_id: str
    status: AlertStatus = AlertStatus.DRAFT
    hazard: str = ""
    severity: AlertSeverity = AlertSeverity.UNKNOWN
    urgency: AlertUrgency = AlertUrgency.UNKNOWN
    certainty: AlertCertainty = AlertCertainty.UNKNOWN
    issued: datetime.datetime | None = None
    expires: datetime.datetime | None = None
    polygon_wkt: str | None = None
    cap_xml: str | None = None
    languages: list[str] = field(default_factory=lambda: ["en", "hi"])
    approved_by: str | None = None
    dismiss_reason: str | None = None
    outcome: str | None = None
    validation_tier: ValidationTier = ValidationTier.EXPERIMENTAL

    def __post_init__(self):
        """R10: Alerts start as DRAFT. Experimental hazards max Watch/Outlook."""
        if self.status == AlertStatus.DRAFT and self.approved_by is not None:
            raise ValueError("DRAFT alerts cannot have an approver")

@dataclass
class ObservabilityIndex:
    """Per-cell observability index components (Section 3.4)."""
    radar_coverage: float = 0.0       # [0,1]
    radar_freshness: float = 0.0      # [0,1]
    sat_geometry: float = 0.0         # [0,1]
    ltg_coverage: float = 0.0         # [0,1]
    env_resolution: float = 0.0       # [0,1] constant informative

    @property
    def composite(self) -> float:
        """Weighted composite OI. Weights are configurable."""
        # Default equal weights; actual weights from config
        components = [
            self.radar_coverage,
            self.radar_freshness,
            self.sat_geometry,
            self.ltg_coverage,
            self.env_resolution,
        ]
        return sum(components) / len(components)

@dataclass
class VerificationScore:
    """A single verification score entry."""
    run_id: str
    model: str
    lead_min: int
    metric: str
    threshold: float
    oi_bucket: str
    value: float
    n: int
