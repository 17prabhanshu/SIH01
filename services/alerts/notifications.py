import logging
import time
from typing import Dict, Any, List
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class Channel(Enum):
    DASHBOARD = "DASHBOARD"
    EMAIL = "EMAIL"
    SMS = "SMS"
    WEBHOOK = "WEBHOOK"

@dataclass
class DeliveryResult:
    channel: Channel
    success: bool
    timestamp: float
    error: str = ""

class NotificationDispatcher:
    def __init__(self):
        self.rate_limits = {
            Channel.SMS: {"count": 0, "window": 3600, "max": 100}, # max 100 SMS per hour
            Channel.EMAIL: {"count": 0, "window": 3600, "max": 1000}
        }
        self.window_start = time.time()

    def _check_rate_limit(self, channel: Channel) -> bool:
        if channel not in self.rate_limits:
            return True
            
        now = time.time()
        limit = self.rate_limits[channel]
        
        if now - self.window_start > limit["window"]:
            self.window_start = now
            for k in self.rate_limits:
                self.rate_limits[k]["count"] = 0
                
        if limit["count"] >= limit["max"]:
            return False
            
        limit["count"] += 1
        return True

    def _format_message(self, alert: Any, channel: Channel) -> str:
        # Use precise scientific language
        if channel == Channel.SMS:
            return f"NER-LEWS ALERT [{alert.severity}]: Model estimates elevated landslide hazard at {alert.location['lat']},{alert.location['lon']}. Conf: {alert.confidence:.2f}. {alert.recommended_action}"
        else:
            return f"""
            NER Landslide Early Warning System - Alert Notification
            
            Alert ID: {alert.alert_id}
            Priority: {alert.priority}
            Location: {alert.location['lat']}, {alert.location['lon']}
            
            Assessment:
            Model estimates an elevated landslide hazard probability with confidence {alert.confidence:.2f}.
            
            Key Evidence:
            {alert.reason}
            
            Exposure Impact:
            - Exposed Population: {alert.affected_assets.get('population', 0)}
            - Critical Assets at Risk: {alert.affected_assets.get('critical_assets', 0)}
            
            Recommended Action:
            {alert.recommended_action}
            
            Timestamp: {alert.timestamp}
            """

    def dispatch(self, alert: Any, channels: List[Channel]) -> List[DeliveryResult]:
        results = []
        for channel in channels:
            if not self._check_rate_limit(channel):
                logger.warning(f"Rate limit exceeded for {channel}")
                results.append(DeliveryResult(channel, False, time.time(), "Rate limit exceeded"))
                continue
                
            msg = self._format_message(alert, channel)
            
            success = False
            error = ""
            retries = 3
            
            while retries > 0 and not success:
                try:
                    if channel == Channel.DASHBOARD:
                        # Call WebSocket service
                        success = True
                    elif channel == Channel.EMAIL:
                        # Send email
                        success = True
                    elif channel == Channel.SMS:
                        # Send SMS
                        success = True
                    elif channel == Channel.WEBHOOK:
                        # Send webhook payload
                        success = True
                except Exception as e:
                    error = str(e)
                    retries -= 1
                    time.sleep(1)
            
            if not success:
                logger.error(f"Failed to dispatch {alert.alert_id} via {channel}: {error}")
            else:
                logger.info(f"Dispatched {alert.alert_id} via {channel}")
                
            results.append(DeliveryResult(channel, success, time.time(), error))
            
        return results
