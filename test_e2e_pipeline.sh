#!/bin/bash
set -e

echo "1. Triggering evaluation via curl..."
curl -s "http://127.0.0.1:8000/api/v1/risk/evaluate?lat=27.3314&lon=88.6138" > response.json
cat response.json | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin), indent=2))' || echo "Failed to parse JSON"

echo -e "\n2. Verifying DB..."
docker exec xsih101-postgres-1 psql -U postgres -d landslide_db -c "SELECT id, run_start, status, logs FROM model_runs ORDER BY run_start DESC LIMIT 1;"

docker exec xsih101-postgres-1 psql -U postgres -d landslide_db -c "SELECT run_id, hazard_evidence_score, severity, prediction_timestamp FROM model_predictions ORDER BY prediction_timestamp DESC LIMIT 1;"

docker exec xsih101-postgres-1 psql -U postgres -d landslide_db -c "SELECT id, severity, title, source_type, issued_at FROM alerts ORDER BY issued_at DESC LIMIT 1;"

