"""Alert processing worker.

Processes alert drafts, manages approval queue.
R10: Alerts are DRAFT until human approves.
"""
from __future__ import annotations

import logging

from core.types import Alert, AlertStatus

logger = logging.getLogger(__name__)


def process_alert_draft(alert: Alert) -> Alert:
    """Process a new alert draft.

    R10: Alert starts as DRAFT, never auto-sent.
    """
    if alert.status != AlertStatus.DRAFT:
        raise ValueError(f"Expected DRAFT alert, got {alert.status}")

    logger.info(f"New alert draft: {alert.alert_id} hazard={alert.hazard}")
    return alert
