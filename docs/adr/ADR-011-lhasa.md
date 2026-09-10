# ADR-011: NASA LHASA Integration

## Status
Accepted

## Context
Need a regional macro-nowcast for landslide hazards.

## Options Considered
- Build custom global model
- Use NASA LHASA

## Decision
Use NASA LHASA as an independent regional macro-nowcast evidence layer. NOT as a site-specific predictor. Resolution must be honestly labelled (~1km, dynamic inputs ~10km).

## Rationale
Provides a solid baseline hazard layer. The NOSA license requires we use outputs and not import it as a library. High false alarm rates in monsoons are acknowledged.

## Consequences
### Positive
- Immediate broad-scale hazard context.
### Negative
- Incompatible license requires external execution or API usage.
### Risks
- Over-reliance by end-users despite resolution warnings.

## Security Implications
Data validation on inputs from external models.

## Cost Implications
Free.

## Review Date
2027-01-01
