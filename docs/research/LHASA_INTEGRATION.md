# NASA LHASA Integration Research

## Phase 1: Official Interface Discovery

### Product Identification
1. **Exact Product Name**: NASA Global Landslide Nowcast
2. **Exact Product/Version**: `Global_Landslide_Nowcast.2.0.0`
3. **Official API/Endpoint**: 
   - NASA Earthdata CMR API (Metadata Discovery): `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=Global_Landslide_Nowcast`
   - GES DISC HTTPS Archive (Direct Data): `https://data.gesdisc.earthdata.nasa.gov/data/Landslide/Global_Landslide_Nowcast.2.0.0/`
   - NASA NCCS ArcGIS REST (Visualization): `https://maps.nccs.nasa.gov/` (Currently blocking automated HTTP requests)
4. **Authentication Required**: Yes. Earthdata Login credentials are required for programmatic download from GES DISC.
5. **API Keys/Tokens**: `.netrc` file configured with Earthdata username/password or a temporary S3 credential token via `https://data.gesdisc.earthdata.nasa.gov/s3credentials`.
6. **Output Format**: NetCDF4 (`.nc4`) for Version 2.0.0, or GeoTIFF (`.tif`) for Version 1.1.
7. **Spatial Resolution**: ~1km (30 arc-seconds) globally.
8. **Temporal Resolution**: Daily.
9. **Latency**: Typically 1-2 days delayed from observation (Near Real-Time processing via GPM IMERG Early/Late runs).
10. **Geographic Coverage**: Global (60°N to 60°S).
11. **Variable Name**: `nowcast` or `hazard_index` (pending inspection of the `.nc4`).
12. **Value Semantics**: Categorical Hazard Class (e.g., 0=No Hazard, 1=Moderate Hazard, 2=High Hazard) OR continuous relative hazard probability, depending on LHASA v1 vs v2 framework.
13. **No-Data Values**: Typically `-9999` or `NaN`.
14. **Type**: Nowcast (Current state estimation based on antecedent rainfall triggers).
15. **Update Frequency**: Daily.
16. **Retention Period**: Version 2.0.0 available from April 2015 to Feb 2021 on GES DISC; Near Real-Time (NRT) requires PMM Publisher API / Landslide Viewer endpoints.
17. **License/Terms**: US Government Public Domain.

---

### Integration Architecture (Planned)
The system will implement a dual-path fallback:
1. **LIVE (PMM Publisher / NCCS REST)**: Attempt to fetch the daily GeoJSON/TIF from the Precipitation & Applications Viewer endpoints.
2. **HISTORICAL (GES DISC CMR)**: If Live is blocked/auth-restricted, fall back to a specific downloaded baseline `.nc4` file (e.g., `20210209`) for structural integration testing.

The returned LHASA value will strictly be mapped as `MODEL_OUTPUT` representing a "Rainfall-Triggered Hazard Assessment" and will NOT be cast to a 0-1 probability without verifying the internal `.nc4` variable semantics.
