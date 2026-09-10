import logging
import os
import ee

logger = logging.getLogger(__name__)

class GEEAuthenticator:
    """Secure authentication for Google Earth Engine."""
    
    def __init__(self, key_path: str = None):
        self.key_path = key_path or os.getenv("EE_SERVICE_ACCOUNT_KEY")
        
    def authenticate(self):
        """Authenticate using service account."""
        try:
            if self.key_path and os.path.exists(self.key_path):
                # Service account auth
                credentials = ee.ServiceAccountCredentials('', self.key_path)
                ee.Initialize(credentials=credentials, project='ner-landslide-platform')
                logger.info("Successfully authenticated GEE via service account.")
            else:
                # Use default credentials (local dev via earthengine authenticate)
                ee.Initialize(project='ner-landslide-platform')
                logger.info("Successfully authenticated GEE via default credentials.")
        except Exception as e:
            logger.error(f"GEE authentication failed: {str(e)}")
            raise
