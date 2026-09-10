# ADR-002: Redis for Caching and Queuing

## Status
Accepted

## Context
A fast, in-memory data store is needed for caching frequent API responses, rate limiting, and holding ephemeral application state.

## Options Considered
- Redis
- Memcached

## Decision
Use Redis 7 for caching, rate limiting, and ephemeral state. Explicitly NOT to be used for primary data storage.

## Rationale
Redis provides robust data structures, persistence options, and is the industry standard for lightweight caching and rate limiting.

## Consequences
### Positive
- Low latency, high throughput.
- Supports complex data types.
### Negative
- Data must fit in memory.
### Risks
- Potential data loss for purely in-memory data if persistence isn't configured correctly.

## Security Implications
Require authentication and TLS for transit.

## Cost Implications
Memory is relatively expensive, keep cache sizes optimized.

## Review Date
2027-01-01
