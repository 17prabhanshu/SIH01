# ADR-005: Deployment Environments

## Status
Accepted

## Context
We need a standard way to package, deploy, and scale the application across different environments (dev, staging, production).

## Options Considered
- Docker Compose everywhere
- Kubernetes everywhere
- Docker Compose for dev, Kubernetes for staging/prod

## Decision
Use Docker Compose for local development and Kubernetes for staging/production. Do NOT deploy a huge K8s cluster for local development.

## Rationale
Balances developer experience with production scalability. Docker Compose is lightweight and fast for dev iteration. K8s provides self-healing, scaling, and rolling updates for prod.

## Consequences
### Positive
- Developers don't need K8s expertise.
- Production is highly resilient.
### Negative
- Discrepancy between dev and prod environments.
### Risks
- Environment-specific bugs not caught locally.

## Security Implications
Need robust K8s RBAC and network policies in prod.

## Cost Implications
K8s control plane has overhead; worthwhile for prod, unnecessary for dev.

## Review Date
2027-01-01
