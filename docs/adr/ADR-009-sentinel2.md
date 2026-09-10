# ADR-009: Sentinel-2 Utilization

## Status
Accepted

## Context
Need high-resolution optical imagery for vegetation index tracking and land-cover change.

## Options Considered
- Landsat (30m)
- Sentinel-2 (10m)

## Decision
Use Sentinel-2 for optical imagery, vegetation, and land-cover change. Primary data source in dry season, with SAR fallback during monsoon.

## Rationale
10m resolution is vastly superior for local landslide feature detection compared to 30m. Cloud cover is acknowledged as a severe limitation during the monsoon.

## Consequences
### Positive
- High-quality spectral indices.
### Negative
- Data gaps due to clouds.
### Risks
- Complete lack of optical data for 3-4 months per year.

## Security Implications
None.

## Cost Implications
Free data.

## Review Date
2027-01-01
