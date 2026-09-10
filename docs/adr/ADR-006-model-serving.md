# ADR-006: Model Serving Strategy

## Status
Accepted

## Context
Need to serve lightweight models (susceptibility, rainfall trigger, fusion) and potentially heavier deep learning models.

## Options Considered
- FastAPI
- BentoML
- NVIDIA Triton

## Decision
Use FastAPI for lightweight models. Evaluate BentoML/Triton only for GPU-intensive foundation model inference. DO NOT deploy Triton for the current 2 XGBoost models.

## Rationale
FastAPI is sufficient for tabular/XGBoost models and simplifies the stack. Triton is massive overkill for CPU-bound lightweight inference.

## Consequences
### Positive
- Lower complexity, less infrastructure overhead.
### Negative
- Potential bottleneck if model complexity suddenly scales up.
### Risks
- Latency spikes under high concurrency for CPU models.

## Security Implications
Standard API security practices.

## Cost Implications
Lower compute costs by avoiding heavy inference servers.

## Review Date
2027-01-01
