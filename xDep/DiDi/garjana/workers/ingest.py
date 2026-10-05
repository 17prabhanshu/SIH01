"""Ingestion worker.

Handles data ingestion from providers and publishes to Redis Streams.
"""
from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


def ingest_observation(source: str, data: bytes) -> dict:
    """Ingest a single observation."""
    logger.info(f"Ingested observation from {source}")
    return {"source": source, "status": "ingested"}
