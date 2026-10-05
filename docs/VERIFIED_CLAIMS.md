# Verified Claims Audit

## Numeric & Status Claims
| Claim | Evidence Command / File | Status |
|---|---|---|
| `84 passed, 0 failed, 0 skipped, 0 xfail` | `cat .system_generated/tasks/task-2056.log \| grep "passed,"` <br> Output: `================== 84 passed, 15 warnings in 65.90s (0:01:05) ==================` | VERIFIED |
| `Coverage ~69%` | `cat .system_generated/tasks/task-2056.log \| grep "TOTAL"` <br> Output: `TOTAL  2763  860  69%` | VERIFIED |
| `7734 total lines` | `find apps ml services -type f \( -name "*.py" -o -name "*.tsx" -o -name "*.ts" \) -not -path '*/node_modules*' -not -path '*/venv*' \| xargs wc -l \| tail -n 1` <br> Output: `8287 total` | PARTIAL (Count is now 8287) |
| `/health` returns `503` | `curl -s -w "%{http_code}\n" -o /dev/null http://localhost:8000/health` <br> Output: `503` | VERIFIED |
| `13/13 pages generated statically` | `cat .system_generated/tasks/task-2074.log \| grep "Generating static pages"` <br> Output: `✓ Generating static pages (13/13)` | VERIFIED |
| `214 kB first load JS` | `cat .system_generated/tasks/task-2074.log \| grep "/ "` <br> Output: `┌ ○ /    214 kB    302 kB` | VERIFIED |
| `7,000ms - 9,500ms per request` | `grep "duration=" .system_generated/tasks/task-2004.log` <br> Output: `GET /api/v1/risk/evaluate status=200 duration=9484.87ms` and `duration=7312.18ms` | VERIFIED |

*Note: No synthetic performance claims (like AUC 0.85, 500 rec/s) were made in the report, as per the strict constraints.*

## Component Reality Check
| Component | Status | Path / Evidence |
|---|---|---|
| **PostgreSQL / PostGIS** | EXISTS-AND-RUNS | `docker-compose.yml` (Service: `postgres`) |
| **Redis** | EXISTS-AND-RUNS | `docker-compose.yml` (Service: `redis`) |
| **MinIO** | CODE-ONLY | `docker-compose.yml` (Present, but container fails to start/auth) |
| **Next.js** | EXISTS-AND-RUNS | `apps/web/package.json` (`npm run build` succeeds) |
| **Docker** | EXISTS-AND-RUNS | `docker-compose.yml` |
| **Google Earth Engine** | EXISTS-AND-RUNS | `services/geospatial/gee/sentinel1.py` |
| **OpenStreetMap (OSM)** | EXISTS-AND-RUNS | `services/fusion/exposure.py` |
| **Open-Meteo** | EXISTS-AND-RUNS | `services/ingestion/openmeteo.py` |
| **RandomForestClassifier** | CODE-ONLY | `ml/rainfall/trigger.py` (Stubbed/Heuristic usage currently) |
| **Scikit-Learn** | CODE-ONLY | `ml/susceptibility/model.py` (Untrained stub) |
| **XGBoost / MintPy / Helm** | NOT-PRESENT | Never mentioned in the audit report, nor found in the codebase. |

## Reconciliation of ML Fusion Claims
The audit strictly reconciles with the statement that **the fusion is hand-weighted with no trained model**. 
- The `FusionPipeline` in `services/fusion/pipeline.py` dynamically fetches live GEE, OSM, and Open-Meteo data, but merges them using empirical formulas (I-D thresholds, spatial clustering, and weighted sum score).
- The `ml/susceptibility/model.py` which wraps `scikit-learn` is currently untrained, acts as a stub, and is bypassed via hardcoded constants/heuristics due to lack of real `data/raw/` CSV files.
- **Therefore, no AUC, Precision, or mathematical accuracy metrics are claimed, as no back-tested neural network or classifier exists.**
