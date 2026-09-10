import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
import enum
from .base import Base, UUIDMixin, TimestampMixin

class ReportCategory(str, enum.Enum):
    NEW_CRACK = "NEW_CRACK"
    SLOPE_MOVEMENT = "SLOPE_MOVEMENT"
    ROCKFALL = "ROCKFALL"
    LANDSLIDE = "LANDSLIDE"
    ROAD_BLOCKAGE = "ROAD_BLOCKAGE"
    DEBRIS = "DEBRIS"
    WATER_SEEPAGE = "WATER_SEEPAGE"
    RETAINING_WALL_DAMAGE = "RETAINING_WALL_DAMAGE"
    OTHER = "OTHER"

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class CitizenReport(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "citizen_reports"

    reporter_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    
    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), index=True)
    state: Mapped[str] = mapped_column(String, index=True)
    district: Mapped[str] = mapped_column(String, index=True)
    
    category: Mapped[ReportCategory] = mapped_column(SQLEnum(ReportCategory))
    description: Mapped[str] = mapped_column(String)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    
    media_urls: Mapped[Optional[list[str]]] = mapped_column(JSONB)
    gps_accuracy: Mapped[Optional[float]] = mapped_column(Float)
    
    verification_status: Mapped[VerificationStatus] = mapped_column(
        SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED
    )
    verified_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"))
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    verification_notes: Mapped[Optional[str]] = mapped_column(String)
