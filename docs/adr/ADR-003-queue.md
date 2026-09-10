# ADR-003: Task Queue Selection

## Status
Accepted

## Context
Background processing is required for heavy computations (e.g., executing remote sensing API requests, running inference models).

## Options Considered
- Celery + Redis
- RabbitMQ
- Kafka
- Amazon SQS

## Decision
Use Celery with Redis broker for the initial deployment.

## Rationale
Provides the simplest operational burden while handling adequate throughput for our initial scale. We are explicitly NOT deploying Kafka unless the event streaming volume exceeds Redis capacity.

## Consequences
### Positive
- Fast implementation and familiar ecosystem for Python developers.
### Negative
- Redis lacks advanced message routing compared to RabbitMQ.
### Risks
- High memory usage if queues back up.

## Security Implications
Ensure broker requires authentication.

## Cost Implications
Low initial cost.

## Review Date
2027-01-01
