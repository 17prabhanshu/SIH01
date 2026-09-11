import ee
import httpx
import json
import asyncio
from datetime import datetime, timezone, timedelta

def init_gee():
    try:
        ee.Initialize(project='pure-wall-462105-q9')
        print("GEE Initialized successfully.")
        return True
    except Exception as e:
        print(f"GEE Initialization failed: {e}")
        return False

async def check_rainfall(lat, lon, start_date, end_date):
    print(f"\n--- Checking Historical Rainfall (Open-Meteo) for {start_date} to {end_date} ---")
    url = f"https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": "rain",
        "timezone": "UTC"
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params)
        if r.status_code == 200:
            data = r.json()
            rain = data.get('hourly', {}).get('rain', [])
            times = data.get('hourly', {}).get('time', [])
            total_rain = sum([r for r in rain if r is not None])
            print(f"Status: AVAILABLE")
            print(f"Total Rain: {total_rain}mm over {len(rain)} hours")
            # Find peak rainfall hour
            if rain:
                max_rain = max([r for r in rain if r is not None])
                max_idx = rain.index(max_rain)
                print(f"Peak rain: {max_rain}mm at {times[max_idx]}")
        else:
            print(f"Status: UNAVAILABLE ({r.status_code})")

def check_sentinel1(lat, lon, start_date, end_date):
    print(f"\n--- Checking Sentinel-1 (SAR) for {start_date} to {end_date} ---")
    point = ee.Geometry.Point([lon, lat])
    collection = (ee.ImageCollection('COPERNICUS/S1_GRD')
                  .filterBounds(point)
                  .filterDate(start_date, end_date)
                  .filter(ee.Filter.eq('instrumentMode', 'IW')))
    
    try:
        info = collection.getInfo()
        features = info.get('features', [])
        print(f"Status: AVAILABLE")
        print(f"Scenes found: {len(features)}")
        for f in features:
            print(f"  - {f['id']} (Acquired: {f['properties']['system:time_start']})")
    except Exception as e:
        print(f"Status: UNAVAILABLE ({e})")

def check_dem(lat, lon):
    print(f"\n--- Checking DEM (SRTM/NASADEM) ---")
    point = ee.Geometry.Point([lon, lat])
    dem = ee.Image('NASA/NASADEM_HGT/001').select('elevation')
    try:
        elev = dem.reduceRegion(reducer=ee.Reducer.mean(), geometry=point, scale=30).getInfo()
        print(f"Status: AVAILABLE")
        print(f"Elevation: {elev.get('elevation')}m")
    except Exception as e:
        print(f"Status: UNAVAILABLE ({e})")

async def main():
    lat = 27.3314
    lon = 88.6138 # Gangtok area (Teesta basin proximity)
    start_date = '2023-10-01'
    end_date = '2023-10-10'
    
    if init_gee():
        check_sentinel1(lat, lon, start_date, end_date)
        check_dem(lat, lon)
    
    await check_rainfall(lat, lon, start_date, end_date)

if __name__ == "__main__":
    asyncio.run(main())
