import ee
import argparse
import sys
from datetime import datetime, timedelta

def diagnose_sentinel1(lat: float, lon: float):
    print("============================================================")
    print("SENTINEL-1 DIAGNOSTIC")
    print("============================================================")
    
    print("\n[1] Determine Access Route")
    print("  Access Route: Google Earth Engine (GEE)")
    print("  Collection: COPERNICUS/S1_GRD")
    
    print("\n[2] GEE Authentication Check")
    try:
        # Authenticate using the user's configured Google Cloud Project
        ee.Initialize(project='pure-wall-462105-q9')
    except Exception as fallback_e:
        err_str = str(fallback_e)
        print("  STATUS: FAIL")
        if "project" in err_str.lower() or "not found" in err_str.lower():
            print("  STAGE: PROJECT_NOT_CONFIGURED")
        elif "credentials" in err_str.lower() or "auth" in err_str.lower():
            print("  STAGE: AUTH_REQUIRED")
        else:
            print("  STAGE: AUTHENTICATION")
        print(f"  ROOT CAUSE: {err_str}")
        print("\n  Sentinel-1\n  STATUS: UNAVAILABLE\n  STAGE: AUTHENTICATION\n  ROOT CAUSE: GEE Credentials not found\n  RECOVERY PATH: Run `earthengine authenticate` or configure Service Account JSON")
        return

    print("  STATUS: PASS")
    
    print("\n[3] Test Catalog Independently")
    try:
        # Define AOI around Gangtok (e.g., 5km buffer)
        aoi = ee.Geometry.Point([lon, lat]).buffer(5000)
        
        # We will use October 2023 as a historical baseline (Sikkim Teesta River flood event occurred Oct 2023)
        start_date = '2023-09-15'
        end_date = '2023-10-15'
        
        print(f"\n[4] Temporal Search (Historical Baseline: {start_date} to {end_date})")
        collection = ee.ImageCollection('COPERNICUS/S1_GRD') \
            .filterBounds(aoi) \
            .filterDate(start_date, end_date)
            
        count = collection.size().getInfo()
        print(f"  Collection ID: COPERNICUS/S1_GRD")
        print(f"  Number of scenes: {count}")
        
        if count == 0:
            print("  STATUS: TEMPORAL_DATA_UNAVAILABLE")
            print(f"  ROOT CAUSE: No Sentinel-1 scenes intersect AOI during {start_date} to {end_date}.")
            return
            
        # Get metadata from all images in the collection
        info = collection.getInfo()
        features = info.get('features', [])
        
        dates = []
        polarizations = set()
        orbits = set()
        
        for f in features:
            props = f.get('properties', {})
            # Date in milliseconds to string
            sys_time = props.get('system:time_start')
            if sys_time:
                dates.append(datetime.utcfromtimestamp(sys_time / 1000.0).strftime('%Y-%m-%d %H:%M:%S'))
            
            pols = props.get('transmitterReceiverPolarisation', [])
            for p in pols:
                polarizations.add(p)
                
            orbits.add(props.get('orbitProperties_pass', 'UNKNOWN'))
            
        dates.sort()
        
        print(f"  Earliest acquisition: {dates[0]}")
        print(f"  Latest acquisition: {dates[-1]}")
        print(f"  Orbit directions: {', '.join(orbits)}")
        
        print("\n[5] Polarization")
        print(f"  Available polarizations: {', '.join(polarizations)}")
        
        print("\n[6] Raw Data Validation")
        first_img = features[0]
        print(f"  ID: {first_img.get('id')}")
        print(f"  Resolution: 10m (Standard IW GRD)")
        
        print("\n[7-11] Build Real Feature / Pre-Post Pair")
        # We have real data. We can select a baseline and comparison.
        # Flood occurred roughly Oct 4.
        pre_event = [d for d in dates if d < '2023-10-04']
        post_event = [d for d in dates if d >= '2023-10-04']
        
        if pre_event and post_event:
            print(f"  Selected Baseline: {pre_event[-1]}")
            print(f"  Selected Comparison: {post_event[0]}")
            print("  STATUS: READY FOR FEATURE EXTRACTION")
        else:
            print("  STATUS: TEMPORAL_DATA_UNAVAILABLE for pre/post pair")
        
        print("\nSUCCESS B:")
        print("    Sentinel-1")
        print("    STATUS: HISTORICAL")
        print(f"    REAL SCENES: {count}")
        print(f"    DATE RANGE: {dates[0]} to {dates[-1]}")
        print(f"    POLARIZATION: {', '.join(polarizations)}")
        print("    PROVENANCE: VERIFIED (Google Earth Engine Catalog)")
        
    except Exception as e:
        print("  STATUS: FAIL")
        print("  STAGE: CATALOG_QUERY")
        print(f"  ROOT CAUSE: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat", type=float, default=27.3314)
    parser.add_argument("--lon", type=float, default=88.6138)
    args = parser.parse_args()
    
    diagnose_sentinel1(args.lat, args.lon)
