import asyncio
import time
import httpx
import statistics

async def simulate_evaluations():
    print("Testing 100 concurrent HTTP requests (Real Performance Benchmark)...")
    
    url = 'http://127.0.0.1:8001/api/v1/risk/evaluate?lat=27.3314&lon=88.6138'
    
    # We will track execution times and errors
    latencies = []
    success_count = 0
    fail_count = 0
    timeout_count = 0
    
    async def fetch(client):
        nonlocal success_count, fail_count, timeout_count
        start = time.perf_counter()
        try:
            response = await client.get(url)
            duration = time.perf_counter() - start
            latencies.append(duration)
            if response.status_code == 200:
                success_count += 1
            else:
                fail_count += 1
        except httpx.ReadTimeout:
            timeout_count += 1
        except Exception:
            fail_count += 1
            
    # Increased timeout to 90s to better capture the tail end instead of failing them
    # as 100 concurrent heavy requests to 1 worker will queue up.
    async with httpx.AsyncClient(timeout=90.0) as client:
        tasks = [fetch(client) for _ in range(100)]
        await asyncio.gather(*tasks)
        
    print(f"\n--- CONCURRENCY BENCHMARK RESULTS ---")
    print(f"Total Requests: 100")
    print(f"Successful: {success_count}")
    print(f"Failed: {fail_count}")
    print(f"Timeouts: {timeout_count}")
    
    if latencies:
        p50 = statistics.quantiles(latencies, n=100)[49]
        p95 = statistics.quantiles(latencies, n=100)[94]
        p99 = statistics.quantiles(latencies, n=100)[98]
        maximum = max(latencies)
        
        print(f"\nLatency (seconds):")
        print(f"P50: {p50:.3f}s")
        print(f"P95: {p95:.3f}s")
        print(f"P99: {p99:.3f}s")
        print(f"Max: {maximum:.3f}s")
    else:
        print("No successful latency data gathered.")

if __name__ == "__main__":
    asyncio.run(simulate_evaluations())
