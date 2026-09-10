# Operations Runbook

## Monitoring
We utilize Prometheus for scraping metrics and Grafana for visualizing them.
- **Key Metrics**: HTTP 5xx error rates, API latency, Celery queue length, database connection pool usage.
- **Dashboards**: Accessible at `https://grafana.internal.domain`.

## Log Aggregation
Logs are structured as JSON and collected via Fluentbit.
- Shipped to an ELK stack (Elasticsearch, Logstash, Kibana).
- Traceability via Request IDs across microservices.

## Alert Response Procedures
Alerts are sent to PagerDuty/Slack.
- **Sev 1**: Site down or data loss. Immediate response required.
- **Sev 2**: Partial degradation (e.g., GEE ingestion failing). Acknowledge within 30m.

## Backup and Restore
- **PostgreSQL**: Daily full backups, WAL archiving to S3 every 10 minutes.
- **MinIO**: Cross-region replication enabled for critical buckets.
- **Restore**: Run `./scripts/restore_db.sh <timestamp>` to restore to a point in time.

## Disaster Recovery
- **RPO (Recovery Point Objective)**: 10 minutes (based on WAL archives).
- **RTO (Recovery Time Objective)**: 4 hours to spin up new infrastructure via Terraform and restore state.

## Model Rollback Procedure
If a new ML model exhibits high false-positive rates:
1. Revert to the previous model tag in configuration.
2. Restart Celery workers.
3. Invalidate recent predictions in the cache.

## Common Troubleshooting
- **Memory Leaks in Workers**: Restart specific pods; check for unclosed GDAL datasets.
- **Missing Sensor Data**: Verify IoT endpoint logs; check if the device battery is dead or network is down.

## Incident Response
1. Assess impact and declare severity.
2. Establish a war room (Slack channel / Zoom).
3. Mitigate the issue (rollback, scale up, block IPs).
4. Root Cause Analysis (RCA) document within 48 hours.
