import asyncio
from services.fusion.exposure import ExposureEngine
import json

async def run():
    engine = ExposureEngine()
    result = await engine.get_exposure_metrics(lat=27.3314, lon=88.6138, radius_m=1000)
    print(json.dumps(result, indent=2))
    
if __name__ == "__main__":
    asyncio.run(run())
