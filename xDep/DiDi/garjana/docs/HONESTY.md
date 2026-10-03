# Garjana — Honesty Disclosure

This document lists every place the system uses non-native data,
proxies, or synthetic information. Updated as the build progresses.

## Data Fidelity

| Component | Fidelity | Notes |
|---|---|---|
| Radar (SEVIR VIL) | SYNTHETIC (US data) | Used for development/training; not Indian |
| Radar (Indian DWR) | PENDING | Awaiting access via SIH/IMD channel |
| Satellite (SEVIR IR) | SYNTHETIC (US data) | Used for development; not INSAT |
| Satellite (INSAT-3DR) | PENDING | MOSDAC account needed |
| Lightning | PROXY | No real Indian feed yet |
| NWP (ERA5) | NATIVE (global reanalysis) | Coarse resolution |
| NWP (GFS) | NATIVE (global forecast) | Coarse resolution |
| DEM | NATIVE | SRTM/Copernicus open data |
| Exposure (OSM) | NATIVE | ODbL attribution |

## UI Labels

- REPLAY banner shown when running from replay bundle
- SYNTHETIC banner when using synthetic/SEVIR data
- All hazard cards show validation_tier badge
- Satellite data labelled "context, upsampled" (never "2 km")

## What We Do NOT Claim

- Not better than IMD; complementary AI fusion layer
- No validated hail/downburst speed prediction in India
- No SACHET integration; CAP 1.2-conformant export only
- No 1 km from satellite; radar carries fine scale
- No foundation model claims
