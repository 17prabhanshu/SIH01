# Data Access Status

| # | Data Source | Status | Notes |
|---|---|---|---|
| 1 | MOSDAC INSAT-3DR/3DS | ⬜ Pending | Need MOSDAC SSO account |
| 2 | IMD DWR volumes | ⬜ Pending | Requested via SIH/MoES channel |
| 3 | ERA5 | ⬜ Pending | CDS download |
| 4 | GFS 0.25° | ⬜ Pending | NOAA open |
| 5 | SEVIR | ⬜ Pending | AWS open data |
| 6 | Indian lightning (IITM/ILDN) | ⬜ Pending | Academic collaboration |
| 7 | NASA LIS | ⬜ Pending | Archive download |
| 8 | DEM (SRTM) | ⬜ Pending | Open |
| 9 | OSM extracts | ⬜ Pending | ODbL |

## Fallback Plan

If raw DWR unavailable:
- Use radar imagery products via authorised route, flagged `derived` + `low_fidelity`
- Use IMERG/GPM as rain truth
- Keep SEVIR for training; Indian INSAT + ERA5 for CI/outlook
