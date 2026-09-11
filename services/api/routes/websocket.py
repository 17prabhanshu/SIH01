import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Convert message to JSON string if it's a dict
        msg_str = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(msg_str)
            except Exception as e:
                logger.error(f"Failed to send message to client: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for live real-time alert streaming to the dashboard.
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for client messages (optional)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        
# For demonstration purposes in the MVP prototype, we'll expose an HTTP endpoint 
# to trigger a broadcast. In production, the background AlertEngine Celery worker 
# would trigger this via Redis Pub/Sub.
@router.post("/api/v1/trigger_test_alert")
async def trigger_test_alert(priority: str = "P1", reason: str = "Anomalous SAR Backscatter and Extreme Rainfall"):
    alert = {
        "type": "NEW_ALERT",
        "data": {
            "alert_id": "ALT-TEST1234",
            "priority": priority,
            "severity": priority.split("_")[0] if "_" in priority else priority,
            "reason": reason,
            "location": {"lat": 27.3314, "lon": 88.6138},
            "timestamp": "Just now"
        }
    }
    await manager.broadcast(alert)
    return {"status": "broadcasted", "alert": alert}
