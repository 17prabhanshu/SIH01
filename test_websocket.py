import asyncio
import websockets
import httpx
import json

async def test_ws():
    print("Connecting to WebSocket...")
    async with websockets.connect("ws://127.0.0.1:8000/api/v1/ws?token=test") as websocket:
        print("WebSocket connected. Triggering evaluation...")
        
        # Trigger evaluation concurrently
        async def trigger():
            async with httpx.AsyncClient() as client:
                await client.get('http://127.0.0.1:8000/api/v1/risk/evaluate?lat=27.3314&lon=88.6138')
        
        asyncio.create_task(trigger())
        
        # Wait for message
        print("Waiting for broadcast message...")
        while True:
            try:
                msg = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                data = json.loads(msg)
                print("Received WebSocket payload:", json.dumps(data, indent=2))
                if data.get("type") == "NEW_ALERT":
                    break
            except asyncio.TimeoutError:
                print("No message received within 10 seconds.")
                break

if __name__ == "__main__":
    asyncio.run(test_ws())
