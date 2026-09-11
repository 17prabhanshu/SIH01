import asyncio
import httpx
import asyncpg
from datetime import datetime

async def test_evaluate_and_verify():
    print("1. Calling /api/v1/risk/evaluate (Gangtok)")
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get('http://127.0.0.1:8000/api/v1/risk/evaluate?lat=27.3314&lon=88.6138')
        print(f"API Status: {response.status_code}")
        data = response.json()
        print("API Response:", data)
    
    print("\n2. Verifying PostGIS Database Persistence")
    conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5435/landslide_db')
    
    print("Checking model_runs...")
    runs = await conn.fetch("SELECT * FROM model_runs ORDER BY created_at DESC LIMIT 1")
    for r in runs:
        print(dict(r))
        
    print("\nChecking model_predictions...")
    preds = await conn.fetch("SELECT * FROM model_predictions ORDER BY created_at DESC LIMIT 1")
    for p in preds:
        print(dict(p))
        
    print("\nChecking alerts...")
    alerts = await conn.fetch("SELECT * FROM alerts ORDER BY created_at DESC LIMIT 1")
    for a in alerts:
        print(dict(a))
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(test_evaluate_and_verify())
