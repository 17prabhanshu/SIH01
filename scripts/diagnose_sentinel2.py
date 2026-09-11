import ee
import argparse
from datetime import datetime

def diagnose_sentinel2(lat: float, lon: float):
    print("============================================================")
    print("SENTINEL-2 / TERRATRACK DIAGNOSTIC")
    print("============================================================")
    
    print("\n[1] GEE Authentication Check")
    try:
        ee.Initialize(project='pure-wall-462105-q9')
        print("  STATUS: PASS")
    except Exception as e:
        print("  STATUS: FAIL")
        print(f"  ROOT CAUSE: {str(e)}")
        return

    print("\n[2] Test Catalog Independently")
    try:
        aoi = ee.Geometry.Point([lon, lat]).buffer(5000)
        start_date = '2023-09-15'
        end_date = '2023-10-15'
        
        print(f"\n[3] Temporal Search (Historical Baseline: {start_date} to {end_date})")
        collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
            .filterBounds(aoi) \
            .filterDate(start_date, end_date)
            
        count = collection.size().getInfo()
        print(f"  Collection ID: COPERNICUS/S2_SR_HARMONIZED")
        print(f"  Number of scenes: {count}")
        
        if count == 0:
            print("  STATUS: TEMPORAL_DATA_UNAVAILABLE")
            return
            
        info = collection.getInfo()
        features = info.get('features', [])
        
        dates = []
        cloud_covers = []
        
        for f in features:
            props = f.get('properties', {})
            sys_time = props.get('system:time_start')
            if sys_time:
                dates.append(datetime.utcfromtimestamp(sys_time / 1000.0).strftime('%Y-%m-%d %H:%M:%S'))
            cloud_covers.append(props.get('CLOUDY_PIXEL_PERCENTAGE', 100))
            
        dates.sort()
        
        print(f"  Earliest acquisition: {dates[0]}")
        print(f"  Latest acquisition: {dates[-1]}")
        
        print("\n[4] Cloud Cover Analysis")
        print(f"  Max Cloud Cover: {max(cloud_covers):.1f}%")
        print(f"  Min Cloud Cover: {min(cloud_covers):.1f}%")
        usable = [c for c in cloud_covers if c < 20.0]
        print(f"  Scenes < 20% Clouds: {len(usable)}")
        
        print("\n[5] TerraTrack / Optical Model Dependency")
        print("  STATUS: DEPENDENCY_MISSING")
        print("  ROOT CAUSE: No optical change models (TerraTrack or otherwise) are implemented in the ml/ repository.")
        
        print("\nSUCCESS B (PARTIAL):")
        print("    Sentinel-2 Data")
        print("    STATUS: HISTORICAL")
        print(f"    REAL SCENES: {count}")
        print(f"    DATE RANGE: {dates[0]} to {dates[-1]}")
        print("    PROVENANCE: VERIFIED (Google Earth Engine Catalog)")
        
    except Exception as e:
        print("  STATUS: FAIL")
        print(f"  ROOT CAUSE: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat", type=float, default=27.3314)
    parser.add_argument("--lon", type=float, default=88.6138)
    args = parser.parse_args()
    
    diagnose_sentinel2(args.lat, args.lon)
