import asyncio
import httpx

async def run():
    print("Triggering test alert via API...")
    async with httpx.AsyncClient() as client:
        r = await client.post("http://127.0.0.1:8000/api/v1/trigger_test_alert")
        print(r.status_code)
        print(r.json())
        
if __name__ == "__main__":
    asyncio.run(run())
