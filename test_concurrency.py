import asyncio
import time
import uuid

async def simulate_evaluations():
    print("Testing 100 concurrent mock evaluations...")
    start_time = time.time()
    
    import httpx
    
    async def fetch(client):
        response = await client.get('http://127.0.0.1:8000/api/v1/risk/evaluate?lat=27.3314&lon=88.6138')
        return response.status_code
        
    async with httpx.AsyncClient(timeout=60.0) as client:
        tasks = [fetch(client) for _ in range(100)]
        results = await asyncio.gather(*tasks)
        
    success = results.count(200)
    failed = len(results) - success
    
    print(f"Concurrency Result: {success} Succeeded, {failed} Failed")
    print(f"Time Taken: {time.time() - start_time:.2f} seconds")
    
if __name__ == "__main__":
    asyncio.run(simulate_evaluations())

