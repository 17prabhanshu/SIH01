import json
import logging
import asyncio
from typing import Dict, List, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException, status

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, token: str):
        # Authenticate token here
        if token != "valid_token": # Placeholder
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total active: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Any):
        if not self.active_connections:
            return
            
        message = json.dumps({
            "type": event_type,
            "data": data
        })
        
        # Create tasks for parallel broadcasting
        tasks = [connection.send_text(message) for connection in self.active_connections]
        
        # Execute tasks and handle failures silently (disconnects will be handled by the route)
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for idx, result in enumerate(results):
            if isinstance(result, Exception):
                logger.warning(f"Failed to send to a connection: {result}")

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=1008)
        return
        
    try:
        await manager.connect(websocket, token)
        
        # Ping-pong loop
        while True:
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                if parsed.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
