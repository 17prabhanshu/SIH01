from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import JSONB
from geoalchemy2 import Geometry
import enum
from .base import Base, UUIDMixin, TimestampMixin

class AssetType(str, enum.Enum):
    ROAD = "ROAD"
    BRIDGE = "BRIDGE"
    SCHOOL = "SCHOOL"
    HOSPITAL = "HOSPITAL"
    SETTLEMENT = "SETTLEMENT"
    POWER = "POWER"
    TELECOM = "TELECOM"
    WATER = "WATER"

class ExposureAsset(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "exposure_assets"

    asset_type: Mapped[AssetType] = mapped_column(SQLEnum(AssetType))
    name: Mapped[Optional[str]] = mapped_column(String)
    
    location: Mapped[str] = mapped_column(Geometry("GEOMETRY", srid=4326), index=True)
    state: Mapped[str] = mapped_column(String, index=True)
    district: Mapped[str] = mapped_column(String, index=True)
    
    population: Mapped[Optional[int]] = mapped_column(Integer)
    criticality_score: Mapped[Optional[float]] = mapped_column(Float)
    
    properties: Mapped[Optional[dict]] = mapped_column(JSONB)
