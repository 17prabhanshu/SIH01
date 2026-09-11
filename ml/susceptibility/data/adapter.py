import abc
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class InventoryRecord(BaseModel):
    """Normalized landslide inventory record."""
    event_id: str
    geometry: Dict[str, Any]  # GeoJSON Point or Polygon
    latitude: float
    longitude: float
    event_date: Optional[datetime]
    trigger_type: Optional[str]
    source: str
    source_record_id: str
    confidence: str  # HIGH, MEDIUM, LOW
    provenance: str
    license: str
    raw_record: Dict[str, Any]

class DataProvenance(BaseModel):
    """Provenance record for imported datasets."""
    dataset_id: str
    source: str
    retrieval_timestamp: datetime
    source_url: str
    version: str
    file_hash: str
    crs: str
    spatial_extent: Dict[str, float]
    temporal_extent: Dict[str, str]
    record_count: int
    processing_steps: List[str]
    license: str
    validation_status: str

class InventoryAdapter(abc.ABC):
    """Abstract interface for all landslide inventory adapters."""
    
    @abc.abstractmethod
    def fetch_data(self, **kwargs) -> Any:
        """Fetch data from the source."""
        pass
    
    @abc.abstractmethod
    def normalize_record(self, raw_record: Any) -> InventoryRecord:
        """Convert a raw source record into a normalized InventoryRecord."""
        pass
    
    @abc.abstractmethod
    def get_provenance(self) -> DataProvenance:
        """Return the provenance details of the dataset."""
        pass

    def process(self, **kwargs) -> Tuple[List[InventoryRecord], DataProvenance]:
        """Fetch, normalize, and return the dataset with provenance."""
        raw_data = self.fetch_data(**kwargs)
        records = [self.normalize_record(r) for r in raw_data]
        provenance = self.get_provenance()
        return records, provenance
