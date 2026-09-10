import logging
import asyncio
from typing import Dict, Any, Optional
import ee

logger = logging.getLogger(__name__)

class GEEClient:
    """GEE client wrapper with connection pooling, retry, and rate limiting."""

    NER_BBOX = {
        "min_lon": 88.0,
        "max_lon": 97.5,
        "min_lat": 21.5,
        "max_lat": 29.5
    }

    NER_GEOMETRY = ee.Geometry.Rectangle(
        [NER_BBOX["min_lon"], NER_BBOX["min_lat"], NER_BBOX["max_lon"], NER_BBOX["max_lat"]]
    )

    def __init__(self, auth_handler: Any = None):
        self.auth_handler = auth_handler
        self._initialized = False

    def initialize(self):
        """Initialize GEE API using provided auth handler."""
        if not self._initialized:
            if self.auth_handler:
                self.auth_handler.authenticate()
            ee.Initialize(project='ner-landslide-platform')
            self._initialized = True
            logger.info("GEE Client initialized successfully.")

    def health_check(self) -> bool:
        """Verify GEE connection."""
        try:
            self.initialize()
            ee.Number(1).getInfo()
            return True
        except Exception as e:
            logger.error(f"GEE health check failed: {str(e)}")
            return False

    async def execute_with_retry(self, gee_object: Any, max_retries: int = 3) -> Any:
        """Execute GEE request with exponential backoff and rate limiting."""
        for attempt in range(max_retries):
            try:
                # In a real async scenario, wrap the synchronous ee request in a thread pool executor.
                loop = asyncio.get_running_loop()
                return await loop.run_in_executor(None, gee_object.getInfo)
            except ee.EEException as e:
                logger.warning(f"GEE request failed (attempt {attempt + 1}/{max_retries}): {e}")
                if attempt == max_retries - 1:
                    logger.error("Max retries reached. GEE operation failed.")
                    raise
                await asyncio.sleep(2 ** attempt)
