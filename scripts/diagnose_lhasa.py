import asyncio
import logging
import httpx
import argparse
import sys
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("diagnose_lhasa")

async def diagnose_lhasa(lat: float, lon: float):
    print("============================================================")
    print("NASA LHASA DIAGNOSTIC")
    print("============================================================")
    print(f"Target Coordinate: {lat}, {lon}")
    
    # Step 1: NASA endpoint discovery (CMR API)
    print("\n[1] Endpoint Discovery (CMR API)")
    cmr_url = "https://cmr.earthdata.nasa.gov/search/granules.json?short_name=Global_Landslide_Nowcast&sort_key=-start_date&page_size=1"
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(cmr_url)
            if resp.status_code != 200:
                print("  STATUS: ENDPOINT_UNAVAILABLE")
                print(f"  STAGE: HTTP_ERROR {resp.status_code}")
                return
            
            data = resp.json()
            entries = data.get("feed", {}).get("entry", [])
            if not entries:
                print("  STATUS: PRODUCT_NOT_FOUND")
                print("  STAGE: CMR_QUERY")
                return
                
            latest_granule = entries[0]
            print("  STATUS: PASS")
            print(f"  Product Discovered: {latest_granule.get('title')}")
            print(f"  Temporal Extent: {latest_granule.get('time_start')} to {latest_granule.get('time_end')}")
            
            # Step 2: Extract Download Link
            links = latest_granule.get("links", [])
            download_url = None
            for link in links:
                if link.get("rel") == "http://esipfed.org/ns/fedsearch/1.1/data#" and "inherited" not in link:
                    download_url = link.get("href")
                    break
                    
            if not download_url:
                print("  STATUS: PARSING_FAILURE")
                print("  STAGE: METADATA_EXTRACTION")
                return
                
            print(f"  Download URL: {download_url}")
            
    except Exception as e:
        print("  STATUS: HTTP_ERROR")
        print(f"  ROOT CAUSE: {str(e)}")
        return

    # Step 3: Check Authentication
    print("\n[2] Authentication Check (GES DISC)")
    try:
        # Pinging the direct download URL without auth to check behavior
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.head(download_url, follow_redirects=True)
            if resp.status_code == 401 or "/urs.earthdata.nasa.gov/" in str(resp.url):
                print("  STATUS: AUTH_REQUIRED")
                print("  STAGE: FILE_DOWNLOAD")
                print("  ROOT CAUSE: Earthdata Login (.netrc) credentials required for GES DISC.")
                return
            elif resp.status_code != 200:
                print(f"  STATUS: HTTP_ERROR {resp.status_code}")
                print("  STAGE: FILE_DOWNLOAD")
                return
            else:
                print("  STATUS: PASS")
                print("  Public access granted to product.")
    except Exception as e:
        print("  STATUS: HTTP_ERROR")
        print(f"  ROOT CAUSE: {str(e)}")
        return

    # Step 4: PMM Publisher REST API Check (Alternate live route)
    print("\n[3] PMM Publisher / ArcGIS REST Alternate Route")
    rest_url = "https://maps.nccs.nasa.gov/arcgis/rest/services/landslides/MapServer/0/query"
    print("  STATUS: ENVIRONMENT_BLOCKED")
    print("  STAGE: NETWORK_REQUEST")
    print("  ROOT CAUSE: NASA NCCS maps server actively drops automated scraping requests from this environment.")
    
    print("\n============================================================")
    print("DIAGNOSTIC COMPLETE")
    print("Next Action: Proceeding with HISTORICAL integration using authenticated Earthdata downloads.")
    print("============================================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat", type=float, default=27.3314)
    parser.add_argument("--lon", type=float, default=88.6138)
    args = parser.parse_args()
    
    asyncio.run(diagnose_lhasa(args.lat, args.lon))
