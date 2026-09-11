# NER Dataset Acquisition Matrix

## Status: SUPERVISED TRAINING BLOCKED
Supervised NER training may begin ONLY when a validated NER inventory exists, provenance passes, labels are inspected, and spatial validation strategy is defined.

---

### Candidate 1: NRSC Landslide Atlas of India (Bhuvan)
- **Source Organisation**: National Remote Sensing Centre (NRSC) / ISRO
- **Dataset Name**: Landslide Atlas of India (Seasonal & Event-based Inventory)
- **URL**: [Bhuvan Disaster Services](https://bhuvan-vec1.nrsc.gov.in/bhuvan/disaster/)
- **Access Mechanism**: Web portal visualization, WMS/WFS endpoints (requires inspection), PDF reports.
- **Geographic Coverage**: India (includes Sikkim, Assam, Meghalaya, Arunachal Pradesh, Manipur, Mizoram, Nagaland, Tripura)
- **Temporal Coverage**: 1998–2022
- **Number of Observations**: ~80,000+ nationally (NER subset requires quantification)
- **Geometry Type**: Point / Polygon (typically mapped from high-res Cartosat/LISS-IV)
- **Trigger Information**: Rainfall, Earthquake (e.g., 2011 Sikkim earthquake)
- **Fields Available**: Location, Year/Season, Trigger (sometimes inferred)
- **Coordinate Reference System**: EPSG:4326 / EPSG:32643-46
- **License/Terms**: Government of India / ISRO terms (typically restricts commercial reuse; research use permitted but raw vector downloads are often restricted).
- **Download Status**: UNAVAILABLE (Raw vectors typically not publicly downloadable without government MOU; WMS layers can be viewed but not extracted as raw training labels).
- **Authentication Requirement**: Registration required for Bhuvan; formal request required for raw vectors.
- **Provenance Confidence**: HIGH
- **Suitability for Supervised Learning**: EXCELLENT (If raw vectors can be legally obtained).

### Candidate 2: GSI Bhukosh Landslide Inventory
- **Source Organisation**: Geological Survey of India (GSI)
- **Dataset Name**: National Landslide Susceptibility Mapping (NLSM) / Inventory
- **URL**: [Bhukosh](https://bhukosh.gsi.gov.in/)
- **Access Mechanism**: ArcGIS REST MapServer (Currently blocking automated scripts/timeouts).
- **Geographic Coverage**: India (includes NER)
- **Temporal Coverage**: Historical to Present
- **Number of Observations**: Unknown (Failed automated fetch)
- **Geometry Type**: Point / Polygon
- **Trigger Information**: Unknown (Schema requires manual inspection)
- **Fields Available**: Unknown (Blocked)
- **Coordinate Reference System**: EPSG:4326
- **License/Terms**: Government of India
- **Download Status**: UNAVAILABLE (API connection timed out).
- **Authentication Requirement**: Formal institutional request likely required to bypass anti-scraping blocks.
- **Provenance Confidence**: HIGH
- **Suitability for Supervised Learning**: EXCELLENT (Official mandate holder for landslides in India).

### Candidate 3: NeSDR (NESAC)
- **Source Organisation**: North Eastern Space Applications Centre (NESAC)
- **Dataset Name**: North Eastern Spatial Data Repository (NER-DRR)
- **URL**: [NeSDR](https://www.nerdrr.gov.in/)
- **Access Mechanism**: Web portal / GeoServer
- **Geographic Coverage**: NER specific
- **Temporal Coverage**: Unknown
- **Number of Observations**: Unknown
- **Geometry Type**: Point / Polygon
- **Trigger Information**: Unknown
- **Fields Available**: Unknown
- **Coordinate Reference System**: EPSG:4326
- **License/Terms**: Government of India (NESAC/ISRO)
- **Download Status**: UNAVAILABLE (Pending manual account creation and data request).
- **Authentication Requirement**: Online registration required.
- **Provenance Confidence**: HIGH
- **Suitability for Supervised Learning**: EXCELLENT (Specifically curated for NER).

### Candidate 4: NASA Global Landslide Catalog (GLC)
- **Source Organisation**: NASA
- **Dataset Name**: Global Landslide Catalog
- **URL**: [NASA Open Data Portal](https://data.nasa.gov/)
- **Access Mechanism**: Earthdata Login / Open Data Portal API (Previous unauthenticated CSV endpoint 404'd).
- **Geographic Coverage**: Global
- **Temporal Coverage**: 2007–Present
- **Number of Observations**: ~11,000 globally
- **Geometry Type**: Point (often low precision, e.g., 5-25km radius)
- **Trigger Information**: Rain, downpour, earthquake, unknown
- **Fields Available**: date, time, country, hazard_type, landslide_type, trigger, fatalties, location_accuracy
- **Coordinate Reference System**: EPSG:4326
- **License/Terms**: US Government Public Domain
- **Download Status**: UNAVAILABLE (Endpoint 404. Requires manual Earthdata retrieval to verify).
- **Authentication Requirement**: Earthdata Login likely required.
- **Provenance Confidence**: MEDIUM (Compiled from media reports, precision is often poor).
- **Suitability for Supervised Learning**: POOR TO MODERATE (Due to low spatial precision [often city-level] and media-reporting bias. Not suitable for high-resolution 30m susceptibility mapping).

---

## Action Plan
1. **DO NOT** train the NER model using NASA GLC due to low spatial precision and media bias.
2. Formal data requests must be initiated by human stakeholders to NRSC or GSI for the authoritative Bhukosh/Bhuvan vector datasets.
3. Until these vectors are acquired, the ML training pipeline (`STATUS = BLOCKED`) will be built using a generalized adapter interface that can ingest them once available.
