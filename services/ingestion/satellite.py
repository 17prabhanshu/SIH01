import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SatelliteMetadataTracker:
    """Tracks availability and freshness of satellite data across NER states."""
    
    STATES = ["Arunachal Pradesh", "Assam", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura"]
    
    def __init__(self):
        self.tracker_state = {state: {} for state in self.STATES}
        
    def update_s1_status(self, state: str, last_acquisition: str, orbit: str):
        """Update Sentinel-1 availability."""
        if state in self.tracker_state:
            self.tracker_state[state]['S1'] = {
                'last_acquisition': last_acquisition,
                'orbit': orbit,
                'freshness': 'OK'
            }
            
    def update_s2_status(self, state: str, last_acquisition: str, cloud_cover: float):
        """Update Sentinel-2 availability."""
        if state in self.tracker_state:
            self.tracker_state[state]['S2'] = {
                'last_acquisition': last_acquisition,
                'cloud_cover': cloud_cover,
                'freshness': 'OK'
            }
