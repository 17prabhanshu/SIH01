import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Float, DateTime, ForeignKey, Boolean
from geoalchemy2 import Geometry
from .base import Base, UUIDMixin, TimestampMixin

class Sensor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "sensors"

    location: Mapped[str] = mapped_column(Geometry("POINT", srid=4326), index=True)
    elevation: Mapped[Optional[float]] = mapped_column(Float)
    
    sensor_type: Mapped[str] = mapped_column(String)
    manufacturer: Mapped[Optional[str]] = mapped_column(String)
    installation_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    sampling_interval: Mapped[Optional[int]] = mapped_column(Float) # in seconds
    measurement_unit: Mapped[str] = mapped_column(String)
    
    calibration_status: Mapped[Optional[str]] = mapped_column(String)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    data_quality: Mapped[Optional[float]] = mapped_column(Float)
    
    battery: Mapped[Optional[float]] = mapped_column(Float)
    signal_quality: Mapped[Optional[float]] = mapped_column(Float)
    firmware: Mapped[Optional[str]] = mapped_column(String)
    
    state: Mapped[str] = mapped_column(String, index=True)
    district: Mapped[str] = mapped_column(String, index=True)

class SensorObservation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "sensor_observations"
    
    sensor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sensors.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String)
    
    quality_score: Mapped[Optional[float]] = mapped_column(Float)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
