from typing import Optional, List, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from services.api.config import DataMode

class DataProvenance(BaseModel):
    source: str
    provider: str
    dataset: str
    version: str
    license: str
    acquisition_time: datetime
    observation_time: datetime
    spatial_resolution: float
    temporal_resolution: str
    checksum: str
    quality_status: str

class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)

class BoundingBox(BaseModel):
    min_lat: float = Field(..., ge=-90, le=90)
    min_lon: float = Field(..., ge=-180, le=180)
    max_lat: float = Field(..., ge=-90, le=90)
    max_lon: float = Field(..., ge=-180, le=180)

class PaginatedResponse(BaseModel):
    data: List[Any]
    total: int
    page: int
    size: int
    pages: int

class ErrorResponse(BaseModel):
    code: str
    message: str
    request_id: str
    retryable: bool

class DependencyHealth(BaseModel):
    status: str
    latency_ms: Optional[float] = None
    error: Optional[str] = None

class HealthCheck(BaseModel):
    status: str
    version: str
    timestamp: datetime
    dependencies: Optional[dict[str, DependencyHealth]] = None
