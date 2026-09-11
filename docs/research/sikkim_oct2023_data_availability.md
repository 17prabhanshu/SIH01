# October 2023 Sikkim Event: Data Availability Gate

## Target
- **Location:** Gangtok, Sikkim (LAT: 27.3314, LON: 88.6138) & Teesta River Basin
- **Event:** South Lhonak Lake GLOF, resulting flash floods, and triggered landslides (Oct 3-4, 2023).

## Data Source Audit

### 1. Rainfall (OpenMeteo Historical Archive)
- **Source:** OpenMeteo ERA5 / IMD Gridded Historical
- **Dataset:** Historical Hourly Precipitation
- **Exact Date Range:** Oct 1, 2023 - Oct 8, 2023
- **Spatial Resolution:** 0.1 degree (~10km)
- **Temporal Resolution:** Hourly
- **Geographic Coverage:** Global (Includes Sikkim)
- **Target Area Covered:** YES
- **Suitability for Replay:** YES (Real historical antecedent/current rainfall available).
- **Legitimate Prior Knowledge:** At T=Oct 3 12:00, the system would only know rain up to that hour.
- **Limitations:** ERA5/Gridded data often underestimates localized orographic cloudbursts compared to AWS ground stations.
- **Status:** `AVAILABLE`

### 2. Sentinel-1 SAR (Google Earth Engine)
- **Source:** ESA Sentinel-1 GRD via GEE
- **Dataset:** `COPERNICUS/S1_GRD`
- **Acquisition Dates:** Pre-event (late Sept) and Post-event (mid-Oct). S1 revisit is 12 days over this region.
- **Spatial Resolution:** 10m
- **Temporal Resolution:** ~12 days
- **Target Area Covered:** YES
- **Suitability for Replay:** YES, but temporal causality must be strictly enforced.
- **Legitimate Prior Knowledge:** On Oct 4, the post-event SAR scene would *not* be available yet. A change-detection map cannot be generated until the post-event satellite pass (e.g. Oct 12).
- **Limitations:** Geometric distortions (layover/shadow) in deep Himalayan valleys like Teesta.
- **Status:** `AVAILABLE (With strict temporal sparsity)`

### 3. Terrain / Elevation (Copernicus DEM)
- **Source:** ESA Copernicus DEM via OpenTopography / GEE
- **Dataset:** `GLO-30`
- **Acquisition Timestamp:** 2011-2015 (Static)
- **Spatial Resolution:** 30m
- **Temporal Resolution:** Static
- **Target Area Covered:** YES
- **Suitability for Replay:** YES
- **Legitimate Prior Knowledge:** Full static DEM available prior to event.
- **Limitations:** Does not reflect topographic changes from the GLOF itself.
- **Status:** `AVAILABLE`

### 4. NASA LHASA (Global Landslide Nowcast)
- **Source:** NASA GPM-based LHASA
- **Dataset:** Global Landslide Hazard Assessment for Situational Awareness
- **Temporal Resolution:** 3-hourly
- **Target Area Covered:** YES
- **Suitability for Replay:** MODERATE. LHASA historical archives require querying NASA servers which may not expose the exact Oct 3, 2023 historical layers publicly via standard open endpoints without authentication.
- **Limitations:** Coarse resolution (1km).
- **Status:** `AUTH_REQUIRED / UNAVAILABLE` (Fallback to un-fused local trigger model)

### 5. Exposure / Infrastructure (OpenStreetMap)
- **Source:** OSM via Overpass API / PostGIS Mirror
- **Dataset:** Roads, Buildings, Critical Infrastructure
- **Temporal Resolution:** Current state (Static approximation)
- **Target Area Covered:** YES
- **Suitability for Replay:** YES
- **Legitimate Prior Knowledge:** Assumes the pre-event 2023 infrastructure network is equivalent to the queried OSM state.
- **Limitations:** OSM might have been updated *after* the flood to mark roads as destroyed. This introduces minor hindsight leakage for exposure (we might evaluate a destroyed bridge as non-existent during the replay).
- **Status:** `AVAILABLE`

### 6. Authoritative Ground Truth Labels (GSI/NRSC)
- **Source:** NRSC Disaster Management Support (DMS) Reports / GSI
- **Dataset:** Oct 2023 Post-Event Landslide Inventory
- **Acquisition Date:** Published weeks/months post-event.
- **Target Area Covered:** YES
- **Suitability for Replay:** NO. This data is future-knowledge.
- **Legitimate Prior Knowledge:** The system knew NOTHING about the actual landslides on Oct 3.
- **Limitations:** Cannot be used as predictive evidence.
- **Status:** `UNAVAILABLE FOR INFERENCE` (Can only be used retrospectively for evaluation metrics).

## Overall Replay Gate Status
**RESULT: `READY (PARTIAL)`**
The core evidence layers (Rainfall, Terrain, Exposure) and intermittent SAR passes are legitimately available in historical archives without hindsight leakage. We can build a scientifically defensible timeline relying on Empirical Triggers and Terrain Evidence, explicitly acknowledging that AI Susceptibility and LHASA are `BLOCKED`.
