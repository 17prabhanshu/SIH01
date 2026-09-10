# ADR-001: PostgreSQL + PostGIS

## Status
Accepted

## Context
The platform requires a robust spatial database capable of handling complex geospatial landslide data, time-series data, and large-scale vector geometries.

## Options Considered
- PostgreSQL with PostGIS
- MongoDB with GeoJSON
- Amazon DynamoDB

## Decision
Use PostgreSQL 16 with PostGIS 3.4.

## Rationale
PostgreSQL + PostGIS offers mature spatial operations, native partitioning support, and is open-source. It is government-grade, scales well for our workload, and is excellent for both time-series and spatial queries.

## Consequences
### Positive
- Rich ecosystem and mature tooling.
- Powerful spatial indexing and query capabilities.
### Negative
- Requires specialized DBA knowledge for tuning and scaling.
### Risks
- Initially deployed as a single node, requiring careful backup strategies before clustering.

## Security Implications
Standard RDBMS security practices apply. Data-at-rest encryption needed.

## Cost Implications
Open-source; primarily compute/storage costs.

## Review Date
2027-01-01
