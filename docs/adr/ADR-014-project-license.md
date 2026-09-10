# ADR-014: Project License

## Status
Accepted

## Context
Need to define the open-source license for the overall platform, navigating complex dependencies.

## Options Considered
- MIT
- Apache 2.0
- GPL-3.0

## Decision
Adopt GPL-3.0 due to MintPy integration. NOSA (LHASA) is GPL-incompatible: use via subprocess/API, not import. All MIT/Apache dependencies are GPL-compatible. Unlicensed repos (Displacement Forecasting): re-implement independently.

## Rationale
GPL-3.0 satisfies the strictest dependencies (MintPy) while allowing government usage. Isolating NOSA ensures compliance. Re-implementing unlicensed code avoids legal risk.

## Consequences
### Positive
- Legal clarity and compliance.
### Negative
- Restricts proprietary commercialization of the codebase.
### Risks
- Accidental inclusion of incompatible code.

## Security Implications
None directly.

## Cost Implications
None.

## Review Date
2027-01-01
