"""Alert delivery adapters (all mock by default).

Available: RSS/Atom feed, webhook stub, SMS stub, WhatsApp stub, in-app.
All are mocks until real delivery channels are configured.
"""
from __future__ import annotations

import datetime
from pathlib import Path

from core.types import Alert


class DeliveryAdapter:
    """Base delivery adapter (mock)."""

    def __init__(self, name: str) -> None:
        self.name = name
        self.delivery_log: list[dict] = []

    def deliver(self, alert: Alert) -> dict:
        entry = {
            "adapter": self.name,
            "alert_id": alert.alert_id,
            "status": "delivered_mock",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        self.delivery_log.append(entry)
        return entry


class RSSAdapter(DeliveryAdapter):
    """RSS/Atom feed adapter."""

    def __init__(self, feed_path: str = "data/alerts_feed.xml") -> None:
        super().__init__("rss")
        self.feed_path = Path(feed_path)

    def deliver(self, alert: Alert) -> dict:
        entry = super().deliver(alert)
        entry["feed_path"] = str(self.feed_path)
        # In production: append to RSS feed file
        return entry


class WebhookAdapter(DeliveryAdapter):
    """Webhook delivery stub."""
    def __init__(self, url: str = "https://example.com/webhook") -> None:
        super().__init__("webhook")
        self.url = url


class SMSAdapter(DeliveryAdapter):
    """SMS gateway stub."""
    def __init__(self) -> None:
        super().__init__("sms")


class InAppAdapter(DeliveryAdapter):
    """In-app notification adapter."""
    def __init__(self) -> None:
        super().__init__("in_app")
