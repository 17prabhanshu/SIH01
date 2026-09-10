from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
import enum
from .base import Base, UUIDMixin, TimestampMixin

class RunStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ModelRun(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "model_runs"

    model_id: Mapped[str] = mapped_column(String, index=True)
    model_version: Mapped[str] = mapped_column(String)
    status: Mapped[RunStatus] = mapped_column(SQLEnum(RunStatus))
    
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float)
    
    input_params: Mapped[Optional[dict]] = mapped_column(JSONB)
    output_summary: Mapped[Optional[dict]] = mapped_column(JSONB)
    data_sources: Mapped[Optional[dict]] = mapped_column(JSONB)
    metrics: Mapped[Optional[dict]] = mapped_column(JSONB)
    
    error_message: Mapped[Optional[str]] = mapped_column(String)
    traceback: Mapped[Optional[str]] = mapped_column(String)
