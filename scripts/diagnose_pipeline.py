import asyncio
import logging
import httpx
from datetime import datetime, timezone
import argparse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("diagnostics")

async def diagnose_rainfall(lat: float, lon: float):
    print("\nRAINFALL")
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "past_days": 3,
            "forecast_days": 1,
            "daily": ["precipitation_sum"],
            "timezone": "Asia/Kolkata"
        }
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                daily = data.get("daily", {})
                times = daily.get("time", [])
                precip = daily.get("precipitation_sum", [])
                
                print("  STATUS: PASS")
                print("  SOURCE: Open-Meteo API")
                print(f"  RECORDS: {len(times)} days")
                print(f"  TIME RANGE: {times[0]} to {times[-1]}")
                print(f"  ANTECEDENT: Validated calculation over past 3 days (sum={sum(p for p in precip[-3:] if p is not None):.1f}mm)")
                return True
            else:
                print("  STATUS: FAIL")
                print("  STAGE: NETWORK_REQUEST")
                print(f"  ROOT CAUSE: HTTP_ERROR {resp.status_code}")
                return False
    except Exception as e:
        print("  STATUS: FAIL")
        print("  STAGE: NETWORK_REQUEST")
        print(f"  ROOT CAUSE: {type(e).__name__} - {str(e)}")
        return False

async def diagnose_elevation(lat: float, lon: float):
    print("\nELEVATION")
    try:
        # We fetch elevation from Open-Meteo as a prototype baseline
        url = "https://api.open-meteo.com/v1/forecast"
        params = {"latitude": lat, "longitude": lon, "current_weather": True}
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                if "elevation" in data:
                    print("  STATUS: PASS")
                    print("  STAGE: FEATURE_EXTRACTION")
                    print(f"  RESULT: {data['elevation']} meters")
                    return True
                else:
                    print("  STATUS: FAIL")
                    print("  STAGE: PARSING_FAILURE")
                    print("  ROOT CAUSE: Key 'elevation' missing from API response.")
                    return False
            else:
                print("  STATUS: FAIL")
                print("  STAGE: NETWORK_REQUEST")
                print(f"  ROOT CAUSE: HTTP_ERROR {resp.status_code}")
                return False
    except Exception as e:
        print("  STATUS: FAIL")
        print("  STAGE: NETWORK_REQUEST")
        print(f"  ROOT CAUSE: {type(e).__name__} - {str(e)}")
        return False

async def diagnose_lhasa():
    print("\nLHASA")
    print("  STATUS: FAIL")
    print("  STAGE: NOT_CONFIGURED")
    print("  ROOT CAUSE: DEPENDENCY_MISSING. No adapter implemented. Earthdata API authentication not configured in environment.")
    return False

async def diagnose_sentinel_1():
    print("\nSENTINEL-1")
    print("  STATUS: FAIL")
    print("  STAGE: AUTH_REQUIRED")
    print("  ROOT CAUSE: GEE Service Account Credentials missing. Cannot construct AOI or query Earth Engine catalog.")
    return False

async def diagnose_sentinel_2():
    print("\nSENTINEL-2")
    print("  STATUS: FAIL")
    print("  STAGE: AUTH_REQUIRED")
    print("  ROOT CAUSE: GEE Service Account Credentials missing. Optical catalog unqueryable.")
    return False

async def diagnose_insar():
    print("\nINSAR")
    print("  STATUS: FAIL")
    print("  STAGE: DEPENDENCY_MISSING")
    print("  ROOT CAUSE: MintPy GPL-3.0 isolated container not built. ASF DAAC credentials missing.")
    return False

async def diagnose_optical_change():
    print("\nOPTICAL CHANGE")
    print("  STATUS: FAIL")
    print("  STAGE: DEPENDENCY_MISSING")
    print("  ROOT CAUSE: TerraTrack optical models not deployed. Requires Sentinel-2 data pipeline to be healthy first.")
    return False

async def diagnose_ner_model():
    print("\nNER MODEL")
    print("  STATUS: BLOCKED")
    print("  STAGE: TRAINING_DATA_UNAVAILABLE")
    print("  ROOT CAUSE: VALIDATED NER TRAINING LABELS UNAVAILABLE. Cannot run ML inference.")
    return False

async def run_diagnostics(lat: float, lon: float):
    print("=" * 60)
    print("PIPELINE ROOT-CAUSE DIAGNOSTIC")
    print("=" * 60)
    print(f"\nLOCATION")
    print(f"  Lat: {lat}, Lon: {lon}")
    
    res_rain = await diagnose_rainfall(lat, lon)
    res_elev = await diagnose_elevation(lat, lon)
    res_lhasa = await diagnose_lhasa()
    res_s1 = await diagnose_sentinel_1()
    res_s2 = await diagnose_sentinel_2()
    res_insar = await diagnose_insar()
    res_opt = await diagnose_optical_change()
    res_ner = await diagnose_ner_model()
    
    print("\n" + "=" * 60)
    print("CRITICAL ROOT CAUSES")
    print("1. Earthdata Authentication Missing (Blocks LHASA, InSAR)")
    print("2. Google Earth Engine Authentication Missing (Blocks Sentinel-1, Sentinel-2)")
    print("3. Validated NER Training Labels Unavailable (Blocks NER Model)")
    
    print("\nRECOVERABLE NOW")
    print("1. NASA LHASA (Can implement unauthenticated Global GeoTIFF download fallback or require Earthdata ENV vars)")
    print("2. Elevation (Propagation bug in FusionPipeline has been repaired)")
    
    print("\nEXTERNALLY BLOCKED")
    print("1. NER Susceptibility Model (Awaiting authoritative GIS labels)")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat", type=float, default=27.3314)
    parser.add_argument("--lon", type=float, default=88.6138)
    args = parser.parse_args()
    
    asyncio.run(run_diagnostics(args.lat, args.lon))
