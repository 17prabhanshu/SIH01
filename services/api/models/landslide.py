from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, DateTime, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
import enum
from .base import Base, UUIDMixin, TimestampMixin

class ValidationStatus(str, enum.Enum):
    UNVALIDATED = "UNVALIDATED"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"

class Landslide(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "landslides"

    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), index=True)
    state: Mapped[str] = mapped_column(String, index=True)
    district: Mapped[str] = mapped_column(String, index=True)
    
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    elevation: Mapped[Optional[float]] = mapped_column(Float)
    
    event_type: Mapped[Optional[str]] = mapped_column(String)
    trigger_type: Mapped[Optional[str]] = mapped_column(String)
    severity: Mapped[Optional[str]] = mapped_column(String)
    
    source: Mapped[str] = mapped_column(String)
    source_id: Mapped[Optional[str]] = mapped_column(String)
    confidence: Mapped[Optional[float]] = mapped_column(Float)
    validation_status: Mapped[ValidationStatus] = mapped_column(SQLEnum(ValidationStatus))
    
    description: Mapped[Optional[str]] = mapped_column(String)
    casualties: Mapped[Optional[int]] = mapped_column(Integer)
    damage_description: Mapped[Optional[str]] = mapped_column(String)
    
    geology: Mapped[Optional[str]] = mapped_column(String)
    land_cover: Mapped[Optional[str]] = mapped_column(String)
    slope_angle: Mapped[Optional[float]] = mapped_column(Float)
    
    data_provenance: Mapped[Optional[dict]] = mapped_column(JSONB)
