# Sentinel-1 Integration Research

## 1. Access Route
The platform currently intends to source Sentinel-1 data via **Google Earth Engine (GEE)** using the `ee.ImageCollection('COPERNICUS/S1_GRD')` catalog. 
The implementation resides in `services/geospatial/gee/sentinel1.py`.

## 2. Authentication Route
Access to GEE requires a configured Google Cloud Service Account (JSON key) with the Earth Engine API enabled, or a local `earthengine authenticate` flow.

## 3. Alternative Routes Evaluated
If GEE is persistently blocked by authentication, there are two primary alternative authoritative routes:
1. **ASF DAAC (Alaska Satellite Facility)**: The US node for Sentinel-1 data. **Blocker**: Requires NASA Earthdata Login credentials (which we already diagnosed as unconfigured during the LHASA investigation).
2. **Copernicus Data Space Ecosystem (CDSE)**: The European node for Sentinel-1 data. **Blocker**: Requires a Copernicus user account and OAuth token generation.

Because all three authoritative routes (GEE, ASF, CDSE) strictly enforce authentication barriers for querying and downloading bulk Sentinel-1 radar imagery, there is no unauthenticated "backdoor" to SAR imagery. The only viable path forward for real SAR data is for the operator to provision credentials (e.g., a GEE Service Account JSON or Earthdata `.netrc`).
