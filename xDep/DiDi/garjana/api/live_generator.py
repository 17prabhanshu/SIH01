import random
import time
from typing import List, Dict

def generate_live_storms(num_cells: int = 3) -> List[Dict]:
    """Generate dynamic synthetic storms over India for 'Live' mode."""
    storms = []
    # Bounding box for India roughly
    lat_min, lat_max = 10.0, 28.0
    lon_min, lon_max = 72.0, 90.0
    
    for i in range(num_cells):
        zmax = random.uniform(35.0, 65.0)
        storms.append({
            "storm_id": f"CELL-{int(time.time())}-{i}",
            "centroid_lat": random.uniform(lat_min, lat_max),
            "centroid_lon": random.uniform(lon_min, lon_max),
            "area_km2": random.uniform(50, 400),
            "zmax": zmax,
            "vil_kg_m2": zmax * random.uniform(0.5, 1.2),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        })
    return storms

def generate_live_hazards(storms: List[Dict]) -> List[Dict]:
    """Generate hazards based on the live storms."""
    hazards = []
    max_zmax = max([s["zmax"] for s in storms], default=0)
    
    # Always include some base hazards if there are storms
    if max_zmax > 30:
        hazards.append({
            "hazard": "heavy_rain",
            "value": min(1.0, (max_zmax - 25) / 35),
            "unit": "probability",
            "validation_tier": "validated"
        })
    if max_zmax > 40:
        hazards.append({
            "hazard": "lightning",
            "value": min(1.0, (max_zmax - 30) / 30),
            "unit": "probability",
            "validation_tier": "proxy"
        })
    if max_zmax > 50:
        hazards.append({
            "hazard": "extreme_rain",
            "value": min(1.0, (max_zmax - 45) / 20),
            "unit": "probability",
            "validation_tier": "experimental"
        })
    return hazards
