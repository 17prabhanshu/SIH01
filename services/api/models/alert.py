from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
import enum
from .base import Base, UUIDMixin, TimestampMixin

class AlertSeverity(str, enum.Enum):
    P1 = "P1" # Critical
    P2 = "P2" # High
    P3 = "P3" # Medium
    P4 = "P4" # Low

class AlertStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"
    EXPIRED = "EXPIRED"

class Alert(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "alerts"

    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), index=True)
    state: Mapped[str] = mapped_column(String, index=True)
    district: Mapped[str] = mapped_column(String, index=True)
    
    severity: Mapped[AlertSeverity] = mapped_column(SQLEnum(AlertSeverity))
    status: Mapped[AlertStatus] = mapped_column(SQLEnum(AlertStatus))
    
    reason: Mapped[str] = mapped_column(String)
    evidence: Mapped[Optional[dict]] = mapped_column(JSONB)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    
    affected_assets: Mapped[Optional[dict]] = mapped_column(JSONB)
    recommended_action: Mapped[Optional[str]] = mapped_column(String)
    
    model_version: Mapped[Optional[str]] = mapped_column(String)
    data_snapshot: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    acknowledged_by: Mapped[Optional[str]] = mapped_column(String)
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
