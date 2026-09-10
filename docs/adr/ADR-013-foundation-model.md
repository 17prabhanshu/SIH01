# ADR-013: Foundation Models

## Status
Accepted

## Context
Potential improvements in model accuracy using modern foundation models for Earth Observation.

## Options Considered
- Custom CNNs
- TerraTorch / TorchGeo
- Prithvi

## Decision
Use TerraTorch + TorchGeo as the framework. Benchmark Prithvi/TerraMind against U-Net baseline on Landslide4Sense. Deploy only if measurable benefit over simpler models. Requires GPU evaluation.

## Rationale
Adopts a scientific, evidence-based approach rather than hype. Standardizing on TorchGeo allows easy model swapping.

## Consequences
### Positive
- Potential for SOTA performance.
### Negative
- Increased complexity and GPU dependence.
### Risks
- High inference cost without proportional accuracy gain.

## Security Implications
Secure handling of model weights.

## Cost Implications
High cost if GPU deployment is required.

## Review Date
2027-01-01
