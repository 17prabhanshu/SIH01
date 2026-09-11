import pandas as pd
import requests
import json
from datetime import datetime

print("Starting DATA VALIDATION GATE...")

# 1. NASA GLC Validation
glc_url = "https://data.nasa.gov/api/views/dd9e-wu2v/rows.csv?accessType=DOWNLOAD"
print(f"Fetching NASA GLC from: {glc_url}")

try:
    df = pd.read_csv(glc_url)
    print("Successfully downloaded and parsed NASA GLC dataset.")
    
    total_records = len(df)
    
    # NER Bounding Box (Approximate): Lat 21.9 to 29.5, Lon 89.6 to 97.5
    ner_df = df[
        (df['latitude'] >= 21.9) & (df['latitude'] <= 29.5) &
        (df['longitude'] >= 89.6) & (df['longitude'] <= 97.5)
    ]
    ner_records = len(ner_df)
    
    # Rainfall triggered in NER
    # GLC typically has 'landslide_trigger' column (e.g. 'rain', 'downpour', 'monsoon')
    rain_triggers = ['rain', 'downpour', 'monsoon', 'continuous_rain', 'tropical_cyclone']
    if 'landslide_trigger' in ner_df.columns:
        rain_ner_df = ner_df[ner_df['landslide_trigger'].str.lower().isin(rain_triggers)]
        rain_ner_records = len(rain_ner_df)
    else:
        rain_ner_records = "UNKNOWN - 'landslide_trigger' column missing"

    available_fields = list(df.columns)
    
    provenance = {
        "source_url": glc_url,
        "retrieval_timestamp": datetime.utcnow().isoformat() + "Z",
        "dataset_version": "NASA GLC Export (Live)",
        "total_record_count": total_records,
        "ner_record_count": ner_records,
        "rainfall_triggered_ner_record_count": rain_ner_records,
        "geographic_extent": {
            "global": {"min_lat": float(df['latitude'].min()), "max_lat": float(df['latitude'].max()),
                       "min_lon": float(df['longitude'].min()), "max_lon": float(df['longitude'].max())},
            "ner_bounding_box": {"min_lat": 21.9, "max_lat": 29.5, "min_lon": 89.6, "max_lon": 97.5}
        },
        "available_fields": available_fields,
        "license_terms": "US Government Public Domain (NASA Open Data)"
    }
    
    with open("glc_provenance.json", "w") as f:
        json.dump(provenance, f, indent=4)
        
    print("\n--- GLC STATISTICS ---")
    print(f"Total Records: {total_records}")
    print(f"NER Records: {ner_records}")
    print(f"Rainfall-Triggered NER Records: {rain_ner_records}")
    print(f"Fields: {available_fields[:10]}...")
    print("Provenance saved to glc_provenance.json")
    
except Exception as e:
    print(f"Failed to fetch/parse NASA GLC: {e}")

# 2. GSI Bhukosh / Bhusanket Validation
print("\nChecking GSI Bhukosh API accessibility...")
# GSI Bhukosh uses ArcGIS REST API typically. Let's try to query the MapServer.
gsi_url = "https://bhukosh.gsi.gov.in/GSI_SMS/rest/services/MapServices/Landslide_Inventory/MapServer/0/query"
params = {
    "where": "1=1",
    "outFields": "*",
    "f": "json",
    "resultRecordCount": 10
}
try:
    # Adding a timeout and generic headers
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(gsi_url, params=params, headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        if "error" in data:
            print(f"GSI API Error: {data['error']}")
        elif "features" in data:
            print(f"GSI API Success! Retrieved {len(data['features'])} sample records programmatically.")
        else:
            print("GSI API Returned unknown JSON structure.")
    else:
        print(f"GSI API HTTP Error: {response.status_code}")
except Exception as e:
    print(f"Failed to connect to GSI Bhukosh: {e}")

