import logging
import httpx
from typing import Dict, Any, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

class OpenMeteoAdapter:
    """
    Adapter for Open-Meteo API to fetch real-world rainfall and elevation data.
    Used for the prototype phase as a reliable, keyless alternative to the IMD API.
    """
    
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    _cache = {}

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)

    async def fetch_current_conditions(self, lat: float, lon: float, time_context: datetime = None) -> Dict[str, Any]:
        """
        Fetch elevation and antecedent rainfall. If time_context is provided, fetches historical data.
        """
        # Cache key based on lat, lon, and time_context
        cache_key = f"{lat}_{lon}_{time_context.isoformat() if time_context else 'live'}"
        now = datetime.utcnow()
        if cache_key in self._cache:
            entry_time, entry_data = self._cache[cache_key]
            if (now - entry_time).total_seconds() < 60:
                return entry_data

        if time_context is None:
            # Live data
            url = self.BASE_URL
            params = {
                "latitude": lat,
                "longitude": lon,
                "past_days": 3,
                "forecast_days": 1,
                "daily": ["precipitation_sum"],
                "timezone": "UTC"
            }
        else:
            # Historical Time Travel
            url = "https://archive-api.open-meteo.com/v1/archive"
            from datetime import timedelta
            end_date = time_context.strftime("%Y-%m-%d")
            start_date = (time_context - timedelta(days=3)).strftime("%Y-%m-%d")
            params = {
                "latitude": lat,
                "longitude": lon,
                "start_date": start_date,
                "end_date": end_date,
                "daily": ["precipitation_sum"],
                "timezone": "UTC"
            }
            
        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            elevation = data.get("elevation", 0.0)
            daily_precip = data.get("daily", {}).get("precipitation_sum", [])
            
            if len(daily_precip) > 0:
                # 24h is the last available day in the window
                rainfall_24h = daily_precip[-1] or 0.0
                # 72h is the sum of up to the last 3 days in the window
                rainfall_72h = sum(p for p in daily_precip[-3:] if p is not None)
            else:
                rainfall_24h = 0.0
                rainfall_72h = 0.0
                
            result = {
                "elevation": elevation,
                "rainfall_24h": rainfall_24h,
                "rainfall_72h": rainfall_72h,
                "status": "SUCCESS",
                "source": "Open-Meteo (Archive)" if time_context else "Open-Meteo (Live)"
            }
            self._cache[cache_key] = (now, result)
            return result
            
        except Exception as e:
            logger.error(f"Failed to fetch data from Open-Meteo: {e}")
            result = {
                "elevation": 0.0,
                "rainfall_24h": 0.0,
                "rainfall_72h": 0.0,
                "status": "FAILED",
                "error": str(e)
            }
            # Cache failures for 10s
            self._cache[cache_key] = (now, result)
            return result

    async def close(self):
        await self.client.aclose()
