# ADR-008: Sentinel-1 Utilization

## Status
Accepted

## Context
Monitoring landslide precursors requires all-weather observation capabilities.

## Options Considered
- Optical only (Sentinel-2, Landsat)
- SAR (Sentinel-1)

## Decision
Use Sentinel-1 for SAR amplitude, change detection, and all-weather monitoring. Prioritize infrastructure corridor monitoring.

## Rationale
SAR penetrates clouds, essential during the monsoon. We acknowledge C-band limitations in dense NER forests (loss of coherence).

## Consequences
### Positive
- Uninterrupted monitoring during monsoons.
### Negative
- Complex processing pipelines required.
### Risks
- Decorrelation in heavily vegetated areas reducing utility.

## Security Implications
None directly.

## Cost Implications
Compute-heavy processing.

## Review Date
2027-01-01
