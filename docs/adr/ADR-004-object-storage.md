# ADR-004: MinIO/S3 Object Storage

## Status
Accepted

## Context
We need a robust object storage solution for raw remote sensing data, processed data, model artifacts, media, reports, and backups.

## Options Considered
- Local filesystem
- MinIO (S3-compatible)
- AWS S3

## Decision
Use MinIO for local development and an S3-compatible object store (e.g., MinIO or AWS S3) for production.
Buckets: raw-data, processed-data, satellite-products, model-artifacts, field-media, reports, backups.

## Rationale
S3 API is the industry standard. MinIO allows exact API parity in local/offline environments.

## Consequences
### Positive
- Vendor lock-in avoidance.
- Simple scaling for massive unstructured data.
### Negative
- Operational overhead if hosting MinIO in production.
### Risks
- Data loss if not properly replicated.

## Security Implications
Strict IAM policies and bucket policies are necessary. Encrypt at rest.

## Cost Implications
Significant savings on egress if hosted on-prem with MinIO.

## Review Date
2027-01-01
