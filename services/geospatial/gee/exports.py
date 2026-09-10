import ee
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class GEEExporter:
    """Export management for GEE results."""
    
    def __init__(self):
        pass
        
    def export_to_drive(self, image: ee.Image, description: str, folder: str, region: ee.Geometry, scale: int = 10) -> ee.batch.Task:
        """Export an Earth Engine Image to Google Drive."""
        task = ee.batch.Export.image.toDrive(
            image=image,
            description=description,
            folder=folder,
            region=region.getInfo()['coordinates'],
            scale=scale,
            crs='EPSG:4326',
            maxPixels=1e13
        )
        task.start()
        logger.info(f"Started export task {task.id} to Drive.")
        return task

    def check_task_status(self, task: ee.batch.Task) -> str:
        """Check the status of an export task."""
        status = task.status()
        state = status.get('state')
        logger.info(f"Task {task.id} state: {state}")
        return state
