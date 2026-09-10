# Data Provenance

To maintain scientific integrity and auditability, all data utilized in the NER Landslide Early Warning platform must adhere to strict provenance tracking.

## Provenance Standards

1. **Source Tracking**: Every dataset must record its original issuing authority, URL/Endpoint, and date of acquisition.
2. **Preprocessing Log**: All spatial transformations (reprojection, resampling, cropping) must be programmatically logged.
3. **Imputation Rules**: Any missing data imputation (e.g., interpolating sparse rainfall grids) must be explicitly documented with the algorithm used.
4. **Version Control**: Datasets (especially ground truth like the GSI NLSM) must be versioned alongside model weights using tools like DVC (Data Version Control).

## Provenance Template

For any new data ingested into the system, the following metadata must be generated and stored in the database:

```json
{
  "dataset_id": "UUID",
  "name": "Dataset Name",
  "source_agency": "Agency Name",
  "acquisition_timestamp": "ISO-8601",
  "spatial_extent": "GeoJSON Bounding Box",
  "crs": "EPSG Code",
  "resolution": "Spatial/Temporal resolution",
  "processing_steps": [
    "Step 1: Reprojected to EPSG:32646",
    "Step 2: Resampled to 10m using Bilinear interpolation"
  ],
  "license": "License Type",
  "checksum": "SHA-256 Hash"
}
```

## Security & Privacy (DPDP 2025)
Data involving human settlements, vulnerabilities, or user interaction must comply with the DPDP 2025 Act, ensuring data erasure workflows and strict access controls.
