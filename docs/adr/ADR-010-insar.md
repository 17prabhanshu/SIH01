# ADR-010: InSAR Strategy

## Status
Accepted

## Context
Need precise ground deformation measurements.

## Options Considered
- SNAP
- MintPy
- ISCE

## Decision
Use MintPy in an isolated GPL container for infrastructure corridor InSAR. Acknowledge NISAR L-band preference for NER forests when operational. C-band (Sentinel-1) only for infrastructure PS targets. GPL isolation required.

## Rationale
MintPy provides state-of-the-art time-series InSAR. Due to its GPL license, it must run in an isolated environment (container/subprocess) to avoid tainting the main platform license.

## Consequences
### Positive
- Millimeter-level deformation tracking.
### Negative
- Licensing complexity.
### Risks
- Legal risk if GPL code is accidentally dynamically linked.

## Security Implications
None directly.

## Cost Implications
High compute requirements.

## Review Date
2027-01-01
