import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ExposureEngine:
    """
    Exposure & Vulnerability Engine using OpenStreetMap Overpass API.
    Calculates critical infrastructure at risk within a hazard radius.
    """
    
    OVERPASS_URL = "https://overpass-api.de/api/interpreter"
    
    async def get_exposure_metrics(self, lat: float, lon: float, radius_m: float = 1000) -> Dict[str, Any]:
        """
        Query Overpass API for buildings, hospitals, schools, and roads within the radius.
        """
        # Overpass QL Query
        query = f"""
        [out:json][timeout:25];
        (
          way["building"](around:{radius_m},{lat},{lon});
          node["amenity"="hospital"](around:{radius_m},{lat},{lon});
          way["amenity"="hospital"](around:{radius_m},{lat},{lon});
          node["amenity"="school"](around:{radius_m},{lat},{lon});
          way["amenity"="school"](around:{radius_m},{lat},{lon});
        way["highway"](around:{radius_m},{lat},{lon});
        );
        out center;
        """
        
        headers = {"User-Agent": "Antigravity-Risk-Platform/1.0"}
        try:
            async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
                response = await client.post(self.OVERPASS_URL, data={'data': query})
                response.raise_for_status()
                data = response.json()
                
                elements = data.get('elements', [])
                
                buildings = 0
                hospitals = 0
                schools = 0
                roads = 0
                
                critical_facilities = []
                
                for el in elements:
                    tags = el.get('tags', {})
                    
                    # Extract coordinates if available (nodes have lat/lon, ways have center if requested, but we used out body)
                    # To get center of ways, we should ideally use 'out center;' in the query, but we can check for lat/lon.
                    lat_coord = el.get('lat') or (el.get('center', {}).get('lat'))
                    lon_coord = el.get('lon') or (el.get('center', {}).get('lon'))
                    
                    name = tags.get('name', 'Unknown Facility')
                    
                    if 'amenity' in tags and tags['amenity'] == 'hospital':
                        hospitals += 1
                        if lat_coord and lon_coord:
                            critical_facilities.append({
                                "type": "Feature",
                                "geometry": {"type": "Point", "coordinates": [lon_coord, lat_coord]},
                                "properties": {"type": "hospital", "name": name}
                            })
                    elif 'amenity' in tags and tags['amenity'] == 'school':
                        schools += 1
                        if lat_coord and lon_coord:
                            critical_facilities.append({
                                "type": "Feature",
                                "geometry": {"type": "Point", "coordinates": [lon_coord, lat_coord]},
                                "properties": {"type": "school", "name": name}
                            })
                    elif 'building' in tags:
                        buildings += 1
                    elif 'highway' in tags:
                        roads += 1
                        
                # Compute criticality (0.0 to 1.0)
                criticality = min(1.0, (hospitals * 0.4) + (schools * 0.2) + (buildings * 0.001) + (roads * 0.01))
                
                return {
                    "status": "SUCCESS",
                    "buildings_exposed": buildings,
                    "hospitals_exposed": hospitals,
                    "schools_exposed": schools,
                    "road_segments_exposed": roads,
                    "exposure_criticality": criticality,
                    "geojson": {
                        "type": "FeatureCollection",
                        "features": critical_facilities
                    }
                }
                
        except Exception as e:
            logger.error(f"Failed to fetch OSM Exposure data: {e}")
            return self._fallback_exposure()
            
    def _fallback_exposure(self):
        return {
            "status": "UNAVAILABLE",
            "buildings_exposed": 0,
            "hospitals_exposed": 0,
            "schools_exposed": 0,
            "road_segments_exposed": 0,
            "exposure_criticality": 0.0
        }
