# ADR-007: Google Earth Engine Integration

## Status
Accepted

## Context
Platform needs access to vast amounts of historical and current satellite imagery.

## Options Considered
- Direct download from ESA/NASA
- Google Earth Engine (GEE)
- AWS Open Data

## Decision
Use GEE as the primary satellite data access layer, isolated behind an adapter pattern. Use Service account authentication only. Never expose credentials to the browser.

## Rationale
GEE abstracts away the enormous storage and compute requirements for planetary-scale satellite data analysis.

## Consequences
### Positive
- Massive reduction in local storage and compute needs.
### Negative
- Dependency on a Google service.
- GEE API limits and quotas.
### Risks
- Unexpected quota exhaustion.

## Security Implications
Service account keys must be securely stored in K8s secrets and never leaked to the client.

## Cost Implications
GEE is generally free for non-commercial/government research, but quota limits apply.

## Review Date
2027-01-01
