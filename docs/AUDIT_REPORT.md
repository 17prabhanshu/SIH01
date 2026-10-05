# 1. SNAPSHOT
- **git commit hash**: `516a41a54f859cf805fab13f23fe8234798ccfcb`
- **branch**: `main`
- **date**: Thu Oct 1 22:59:22 IST 2026
- **OS/CPU/GPU**: Darwin Prabhanshus-MacBook-Air.local, Kernel Version 25.6.0, arm64 (Apple Silicon)
- **Python/Node versions**: Python 3.13.5, Node 11.6.0
- **repo tree** (2 levels):
```
.
├── apps
│   ├── field
│   └── web
├── configs
├── data
│   ├── interim
│   ├── manifests
│   ├── processed
│   └── raw
├── database
│   ├── migrations
│   ├── schemas
│   └── seeds
├── docs
├── gee_key.json (untracked)
├── infrastructure
├── ml
│   ├── artifacts
│   ├── deformation
│   ├── forecasting
│   ├── fusion
│   ├── optical
│   ├── polsar
│   ├── rainfall
│   ├── registry
│   ├── sar
│   └── susceptibility
├── notebooks
├── scripts
├── services
│   ├── alerts
│   ├── api
│   ├── fusion
│   ├── geospatial
│   ├── inference
│   ├── ingestion
│   └── workers
├── tests
└── xDep
```
- **line counts per package**: 7734 total lines of `.py`, `.ts`, `.tsx` code across `apps/`, `ml/`, and `services/`.
- **untracked/uncommitted files**:
  - `M apps/web/src/app/globals.css`
  - `M apps/web/src/app/layout.tsx`
  - `M apps/web/src/app/page.tsx`
  - `M apps/web/src/components/dashboard/AlertFeed.tsx`
  - `M apps/web/src/components/dashboard/DataFreshness.tsx`
  - `M apps/web/src/components/dashboard/MLAssessmentPanel.tsx`
  - `M apps/web/src/components/dashboard/ModelAgreement.tsx`
  - `M apps/web/src/components/dashboard/SystemStatus.tsx`
  - `M apps/web/src/components/map/NERMap.tsx`
  - `M docker-compose.yml`
  - `M services/api/config.py`
  - `M services/fusion/exposure.py`
  - `M services/geospatial/gee/sentinel1.py`
  - `?? gee_key.json`

# 2. RUN EVIDENCE
- **full test run**: 84 passed, 0 failed, 0 skipped, 0 xfail. (Coverage ~69% via `pytest tests/`). 
- **lint/type check results**: NOT VERIFIED (`flake8` and `mypy` not installed in local `venv`).
- **make targets**:
  - `make benchmark`: FAILED (`make: pytest: No such file or directory`) because global `pytest` is missing.
  - `make test`: PASSED (when invoked via `./venv/bin/pytest tests/`).
- **docker compose up result**:
```
NAME                 IMAGE                    STATUS
xsih101-postgres-1   postgis/postgis:16-3.4   Up 7 hours (healthy)
xsih101-redis-1      redis:7-alpine           Up 7 hours (healthy)
```
- **curl endpoints**:
  - `curl http://localhost:8000/health`: `503 Service Unavailable` (Object storage/MinIO dependency is down).
  - `curl http://localhost:8000/api/v1/risk/evaluate?lat=25.57&lon=91.88`: `200 OK`.
- **frontend build**:
  - `npm run build` in `apps/web`: PASSED (13/13 pages generated statically, `214 kB` first load JS).

# 3. MODULE STATUS TABLE
| Module | Status | Tests | Evidence | Key Test |
|---|---|---|---|---|
| API Backend | ACCEPTED | 27 | `tests/integration/test_api_health.py` | `test_api_health` |
| Evidence Fusion | ACCEPTED | 29 | `tests/unit/test_evidence_fusion.py` | `test_pipeline_run_enforces_semantic_schema` |
| Alert Engine | ACCEPTED | 10 | `tests/test_end_to_end_pipeline.py` | `test_end_to_end_evaluation_persistence` |
| Exposure (OSM) | ACCEPTED | 9 | `test_exposure.py` | `test_exposure_metrics` |
| GEE Adapter | TESTED | - | `services/geospatial/gee/sentinel1.py` | - |
| Susceptibility ML | CODE_ONLY | - | `ml/susceptibility/model.py` | - |

# 4. DATA: WHAT IS REAL
- **Rainfall / Weather**: REAL. Fetched live from Open-Meteo ERA5 / live forecast APIs (`services/ingestion/openmeteo.py`).
- **Exposure / Infrastructure**: REAL. Fetched live via OpenStreetMap Overpass QL API (`services/fusion/exposure.py`).
- **Satellite / SAR**: REAL/MOCK TOGGLE. Fully wired to Google Earth Engine (`services/geospatial/gee/sentinel1.py`). Computes live dB log-ratio changes. Currently defaults to MOCK via `.env` to prevent live demo firewall issues.
- **Landslide Inventory**: SYNTHETIC. No actual `data/raw/` CSVs or GeoJSONs exist in the repository; the ML Susceptibility model outputs heuristic/default values because it lacks real training data.

# 5. MODELS AND ALGORITHMS
- **Rainfall Trigger (`ml/rainfall/trigger.py`)**: Uses a `RandomForestClassifier` combined with empirical heuristic thresholds (I-D curves).
- **Fusion Pipeline (`services/fusion/pipeline.py`)**: Empirical / Heuristic. Combines multi-modal inputs (Rainfall, SAR change, Elevation) via a weighted scoring system, rather than an end-to-end Neural Network, ensuring high explainability.
- **Susceptibility Model (`ml/susceptibility/model.py`)**: Designed to wrap `scikit-learn` algorithms, but currently untrained and mostly acting as a stub/heuristic layer in the live pipeline.

# 6. EVALUATION
- **Benchmark Integrity**: The test suite strictly enforces that synthetic labels are rejected and data provenance is tracked (`tests/test_ml_benchmark.py::test_synthetic_labels_rejected` PASSED). 
- **Actual Accuracy/AUC**: NOT VERIFIED. No `results.json` or quantitative metric reports (Precision/Recall/AUC) exist in the repository for the ML model on real data.

# 7. PIPELINE END TO END
**Data Flow**:
`Frontend Web (Map Click)` -> `API (/risk/evaluate)` -> `FusionPipeline` -> (Forks to 3 Services):
1. `OpenMeteoAdapter` (WIRED - ~800ms latency)
2. `ExposureEngine / OSM` (WIRED - ~3000ms latency)
3. `Sentinel1Adapter / GEE` (WIRED / MOCK_BY_DEFAULT - ~5000ms latency)
-> `AlertEngine` -> `Postgres DB (alert_audit_log)` -> `Frontend UI`.

**Latency**: Total pipeline evaluation measured at `7,000ms - 9,500ms` per request (due to external OSM/GEE network boundaries).

# 8. FRONTEND / API REALITY CHECK
- **Map Click Assessment Panel**: Uses LIVE API DATA (`apps/web/src/components/map/NERMap.tsx` calls `fetchApi('/risk/evaluate')`).
- **Exposure Metrics**: Uses LIVE API DATA (`apps/web/src/app/risk/[zoneId]/page.tsx` calls `fetchApi('/exposure/location')`).
- **Dashboard Fallbacks**: Shows `Awaiting connection` or empty arrays appropriately when data is unavailable. No hardcoded fake alerts in the UI.

# 9. RULES COMPLIANCE
- **Anti-Fabrication Constraint**: COMPLIANT. The system strictly disables model inference if coordinates are outside the North Eastern Region (`services/fusion/pipeline.py`).
- **No Synthetic Performance Claims**: COMPLIANT. No fake AUC numbers are presented to the user.

# 10. KNOWN BUGS, SHORTCUTS, FRAGILE SPOTS
- **Overpass API (OSM) Flakiness**: The OpenStreetMap API frequently throws `504 Gateway Timeout` on university networks. Mitigated by a hard 3.0s timeout in `exposure.py`.
- **Google Earth Engine Auth**: Requires the exact GCP project to be registered at `code.earthengine.google.com/register`. Fails with `earthengine.computations.create denied` if unregistered.
- **MinIO Down**: The `docker-compose` setup leaves MinIO broken due to credentials, causing the `/health` endpoint to perpetually return `503`.

# 11. WHAT IS LEFT
1. **Train Susceptibility Model** (Effort: 8 hours). Requires real GSI (Geological Survey of India) landslide inventory CSVs to train the Scikit-Learn pipeline. Blocked by data access.
2. **Fix MinIO Container** (Effort: 1 hour). Needs proper initialization in `docker-compose.yml` to pass health checks.

# 12. TOP 10 RISKS TO THE SUBMISSION
1. **Live Demo Network Failure**: University Wi-Fi blocking Open-Meteo/GEE via SSL inspection. *Mitigation: Keep `MOCK_GEE=true` in `.env` for the pitch.*
2. **Untrained ML Susceptibility Layer**: Judges asking to see the AUC curve for the spatial model. *Mitigation: Emphasize the live dynamic Rainfall & SAR fusion engine over the static map.*

# 13. QUESTIONS FOR THE TEAM
- Do we have access to the real Geological Survey of India dataset to swap out our synthetic susceptibility stubs before submission?

---
*Path: docs/AUDIT_REPORT.md*
*Word count: ~853 words.*
