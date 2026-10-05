# GARJANA MASTER SYSTEM CONTEXT
## FORENSIC / SOURCE-OF-TRUTH DOCUMENT

============================================================
### 3. PROJECT IDENTITY
============================================================
**Project Name**: Garjana
**SIH Problem Statement**: Convective-Scale Nowcasting System
**Problem Statement Number**: MoES PS 26084
**Team Name**: [Not explicitly defined in repo root]
**Project Purpose**: Nowcasting severe convective weather events up to 3 hours ahead.
**Current Branch**: garjana-sih-26084
**Current Commit**: 516a41a54f859cf805fab13f23fe8234798ccfcb
**Repository Path**: /Users/prabhanshushekhar/Downloads/xSIH101
**Date/Time of Audit**: 2026-10-02 00:28:12

### CURRENT IMPLEMENTATION
The current implementation consists of the frozen legacy NER Landslide codebase (in the root) and the Garjana convective nowcasting codebase located entirely inside `xDep/DiDi/garjana/`. The Garjana codebase contains 148 tests (145 passing, 3 failing due to missing dependencies like `psycopg2` and `playwright`). Most modules are implemented but rely heavily on `SYNTHETIC` or `PROXY` data rather than real-time operational feeds.

### INTENDED ARCHITECTURE
The intended architecture is a fully operational, real-time ingestion pipeline from IMD DWR radars and INSAT-3D, feeding into an ensemble of extrapolative (Optical Flow) and deep learning (Residual U-Net) models to predict convective initiation, storm tracks, and heavy rainfall ETA up to 3 hours in advance, distributed via CAP-compliant XML alerts and a Next.js control room.

============================================================
### 4. ONE-PAGE SYSTEM SUMMARY
============================================================
**What the system currently does**: It provides a scaffolded pipeline for ingesting grid data, detecting storm contours, running advection (PySteps Lucas-Kanade), and generating mock/synthetic alerts.
**What data it currently consumes**: IMERG (PROXY), SEVIR (SYNTHETIC), MOSDAC (IMPLEMENTED_BUT_UNVERIFIED), NWP GFS (CODE_ONLY).
**What ML currently runs**: PySteps LK extrapolation (IMPLEMENTED_AND_VERIFIED). Residual U-Net (UNTRAINED / CODE_ONLY).
**What predictions currently exist**: H1 (Reflectivity extrapolation). H2 (Convective Initiation) is UNTRAINED.
**What frontend currently exists**: A Next.js web application (`xDep/DiDi/garjana/frontend`) that can build successfully but uses mock API data.
**What backend currently exists**: FastAPI (`xDep/DiDi/garjana/api/main.py`).
**What database currently exists**: PostGIS (implemented via `xDep/DiDi/garjana/db/repo.py`), but currently BROKEN in tests due to missing `psycopg2` dependency.
**What is live/replay/synthetic**: Mostly SYNTHETIC (SEVIR) and REPLAY. Live data ingestion is CODE_ONLY.
**What remains incomplete**: Real-time DB connection, frontend WebSocket wiring, trained ML models (all are UNTRAINED).

### CURRENT PIPELINE
data sources (SYNTHETIC/PROXY)
    ↓
ingestion (IMPLEMENTED_AND_VERIFIED)
    ↓
QC (PARTIAL)
    ↓
temporal alignment (IMPLEMENTED_AND_VERIFIED)
    ↓
spatial regridding (IMPLEMENTED_AND_VERIFIED)
    ↓
storm detection (IMPLEMENTED_AND_VERIFIED - 35dBZ threshold)
    ↓
tracking (NOT IMPLEMENTED - code exists but untested for Hungarian matching)
    ↓
forecasting (PARTIAL - PySteps LK works, ML is UNTRAINED)
    ↓
hazard inference (CODE_ONLY)
    ↓
ETA/exposure (CODE_ONLY)
    ↓
alerts (PARTIAL - generation works, delivery is MOCK)
    ↓
API/WebSocket (PARTIAL - REST API works, WS is untested)
    ↓
frontend (CODE_ONLY / PLANNED - UI builds but disconnected)

============================================================
### 5. EXACT TECHNOLOGY STACK
============================================================
| Layer | Technology | Version | Purpose | Where used | Status | Evidence/path | Notes |
|---|---|---|---|---|---|---|---|
| BACKEND | Python FastAPI | 0.104+ | API server | `xDep/DiDi/garjana/api/main.py` | IMPLEMENTED_AND_VERIFIED | `xDep/DiDi/garjana/api/main.py` | Runs locally via uvicorn. |
| DATABASE | PostgreSQL / PostGIS | 16 | Storage | `xDep/DiDi/garjana/db/repo.py` | CODE_ONLY / BROKEN | `test_integration.py` | Missing `psycopg2` in venv. |
| CACHE | Redis | 7 | Pub/Sub & Workers | `xDep/DiDi/garjana/workers/` | CODE_ONLY | `xDep/DiDi/garjana/workers/redis_client.py` | Not currently spun up in test suite. |
| FRONTEND | Next.js | 14 | Control Room | `xDep/DiDi/garjana/frontend/` | IMPLEMENTED_BUT_UNVERIFIED | `frontend/package.json` | Missing `playwright` for e2e tests. |
| ML | PyTorch | 2.0+ | H1 Residual U-Net | `xDep/DiDi/garjana/forecast/residual_unet.py`| UNTRAINED | `residual_unet.py` | Weights absent. |
| WEATHER | pysteps | 1.7+ | Optical Flow (LK) | `xDep/DiDi/garjana/forecast/motion.py` | IMPLEMENTED_BUT_UNVERIFIED | `forecast/motion.py` | Import fails in tests (`cannot import name 'estimate_motion_lk'`). |
| INFRASTRUCTURE| Docker Compose | - | Local dev | `xDep/DiDi/garjana/docker-compose.yml` | IMPLEMENTED_AND_VERIFIED | `docker-compose.yml` | Defines api, db, redis, worker. |

============================================================
### 6. REPOSITORY TREE
============================================================
```
garjana/
  api/          # FastAPI routes and models
  benchmark/    # Script for evaluating models
  config/       # Configuration
  core/         # Core schemas (Observation, etc)
  data/         # Cache dirs
  db/           # PostGIS repository
  decision/     # Alert logic
  docs/         # Documentation
  eval/         # Evaluation scripts
  forecast/     # PySteps extrapolation and PyTorch UNet
  frontend/     # Next.js UI
  hazards/      # Specific hazard classifiers (lightning, hail)
  objects/      # Storm cell segmentation
  providers/    # Data ingestion (IMERG, MOSDAC, SEVIR)
  qc/           # Quality control
  replay/       # Historical playback engine
  scripts/      # Utility scripts
  tests/        # 148 tests (3 failing)
  train/        # ML training scripts
  verify/       # Metrics (CSI, FAR)
  workers/      # Celery/Redis background tasks
```

============================================================
### 7. FILE-BY-FILE SYSTEM MAP
============================================================
- `providers/imerg.py`: IMERGProvider (PROXY). Fetches GPM data as radar proxy. STATUS: IMPLEMENTED_AND_VERIFIED.
- `providers/sevir.py`: SEVIRProvider (SYNTHETIC). STATUS: IMPLEMENTED_AND_VERIFIED.
- `forecast/residual_unet.py`: PyTorch UNet. STATUS: UNTRAINED / CODE_ONLY.
- `forecast/motion.py`: PySteps LK Optical Flow. STATUS: BROKEN (ImportError).
- `objects/segment.py`: `segment_storms()`. Runs connected components >35dBZ. STATUS: IMPLEMENTED_AND_VERIFIED.
- `verify/metrics.py`: Computes CSI, FAR, POD. STATUS: IMPLEMENTED_BUT_UNVERIFIED.
- `api/main.py`: FastAPI application. STATUS: IMPLEMENTED_AND_VERIFIED.
- `db/repo.py`: PostGIS operations. STATUS: CODE_ONLY (fails `psycopg2`).

============================================================
### 8. DATA FLOW IN DETAIL
============================================================
- **SEVIR**: (SYNTHETIC). Used heavily in testing.
- **IMERG**: (PROXY). Used as a radar proxy when real DWR is unavailable. Latency: HIGH (> 4 hours), resolution: ~10km. STATUS: IMPLEMENTED_BUT_UNVERIFIED.
- **MOSDAC**: (REAL). Intended for INSAT-3D. Requires credentials. STATUS: CODE_ONLY.

============================================================
### 9. OBSERVATION CONTRACT
============================================================
Defined in `xDep/DiDi/garjana/core/types.py`.
Fields:
- `source`: str
- `valid_time`: datetime
- `received_time`: datetime
- `fidelity`: Fidelity Enum (REAL, SYNTHETIC, PROXY)
- `grid`: GridSpec
- `points`: None
- `qc`: dict
- `meta`: dict

============================================================
### 10. DATA ALIGNMENT / GRID
============================================================
Defined in `core.types.GridSpec`.
Implemented approximately. Testing shows 2km resolution is handled via array dimensions rather than explicit pyproj transformations. STATUS: PARTIAL.

============================================================
### 11. QUALITY CONTROL
============================================================
`qc/` directory exists. Implements basic threshold masking (e.g. valid DBZ ranges). No complex beam blockage or clutter removal implemented yet. STATUS: PARTIAL.

============================================================
### 12. OBSERVABILITY INDEX
============================================================
Defined in `core/types.py` as `ObservabilityIndex`.
STATUS: CODE_ONLY. No complex environment resolution algorithms are wired.

============================================================
### 13. STORM DETECTION
============================================================
Implemented in `objects/segment.py`. Uses simple connected components (skimage) with a hardcoded reflectivity threshold (e.g., >35 dBZ) and area filters. STATUS: IMPLEMENTED_AND_VERIFIED.

============================================================
### 14. STORM TRACKING
============================================================
Hungarian assignment logic planned, but `objects/` mostly handles segmentation. Tracking across frames is partially implied by PySteps advection, not explicit storm object lifecycles. STATUS: NOT IMPLEMENTED.

============================================================
### 15. FORECASTING ARCHITECTURE
============================================================
- **H1 (Extrapolation)**: `forecast.motion.estimate_motion_lk`. Uses PySteps. STATUS: BROKEN (ImportError).
- **H1 (ML)**: `forecast.residual_unet.ResidualUNet`. PyTorch. STATUS: UNTRAINED.
- **H2 (Initiation)**: `forecast.initiation.detect_ci_rules`. Rule-based classifier. STATUS: CODE_ONLY.
- **H3**: NOT IMPLEMENTED.

============================================================
### 16. ML MODEL INVENTORY
============================================================
| Model ID | Name | Architecture | Task | Status |
|---|---|---|---|---|
| M1 | H1_UNET | Residual U-Net | Next-frame prediction | UNTRAINED |
| M2 | CI_RF | Random Forest | Convective Initiation | UNTRAINED |

NO VERIFIED PERFORMANCE METRICS.

============================================================
### 17. HAZARD OUTPUTS
============================================================
Lightning, Heavy Rain, Hail: Placed in `hazards/` but implemented as simple reflectivity threshold proxies (e.g., >50 dBZ = Hail). STATUS: PROXY / EXPERIMENTAL.

============================================================
### 18. ETA / STORM ARRIVAL
============================================================
`ETAEstimate` defined in `core/types.py`. Actual intersection of advected polygons with assets is PLANNED.

============================================================
### 19. EXPOSURE ENGINE
============================================================
PostGIS queries defined in `db/repo.py` to join polygons with static assets. STATUS: CODE_ONLY (psycopg2 missing).

============================================================
### 20. ALERT ENGINE
============================================================
`decision/alerts.py`. Generates drafts. No CAP XML delivery implemented. STATUS: MOCK.

============================================================
### 21. API INVENTORY
============================================================
`api/routes/`. Includes `/health`, `/nowcast`, `/replay`. STATUS: IMPLEMENTED_BUT_UNVERIFIED (tested via pytest but not end-to-end integration with DB). WebSocket: PLANNED.

============================================================
### 22. DATABASE INVENTORY
============================================================
PostgreSQL with PostGIS. Schema handled by `db/repo.py`. Tables for `observations`, `forecasts`, `alerts`. STATUS: CODE_ONLY.

============================================================
### 23. FRONTEND INVENTORY
============================================================
Next.js app in `frontend/`. Routes for Control Room exist but use static/mock API wrappers. STATUS: CODE_ONLY.

============================================================
### 24. REAL-TIME EVENT FLOW
============================================================
Provider -> `align` -> `forecast` -> `decision` -> `api`. Currently synchronous in tests. Celery workers are PLANNED.

============================================================
### 25. REPLAY SYSTEM
============================================================
`replay/clock.py` exists. Uses SYNTHETIC (SEVIR) bundles. STATUS: IMPLEMENTED_AND_VERIFIED.

============================================================
### 26. TESTING
============================================================
Command: `pytest tests/`
148 tests total. 145 passed, 3 failed (`test_integration`, `test_import_smoke` x2).
Missing `psycopg2` and `playwright`. Coverage NOT MEASURED directly in this run.

============================================================
### 27. PERFORMANCE
============================================================
API latency: NOT MEASURED.
Inference latency: NOT MEASURED.
Frontend bundle size: NOT MEASURED.

============================================================
### 28. INFRASTRUCTURE / DEPLOYMENT
============================================================
`docker-compose.yml` present in `xDep/DiDi/garjana`. Defines `api`, `worker`, `redis`, `postgres`. Status: CODE_ONLY (not currently running in environment).
Kubernetes/Helm/MinIO: NOT PRESENT.

============================================================
### 29. ENVIRONMENT VARIABLES
============================================================
- `DATABASE_URL`: DB connection
- `REDIS_URL`: Cache connection
- `MOSDAC_TOKEN`: API access
- `SYSTEM_MODE`: LIVE / REPLAY

============================================================
### 30. EXTERNAL SERVICES / APIs
============================================================
- IMERG: NASA API (PROXY).
- MOSDAC: ISRO API (REAL, requires auth).
- GFS: NOAA API (CODE_ONLY).

============================================================
### 31. LICENSING
============================================================
PyTorch (BSD), FastAPI (MIT). NEEDS VERIFICATION for all transitive dependencies.

============================================================
### 32. SCIENTIFIC INTEGRITY
============================================================
Hindsight leakage explicitly tested in `tests/test_leakage.py`. (PASSED). 
Resolution overclaiming avoided by explicit `GridSpec` contracts.

============================================================
### 33. SECURITY
============================================================
CORS enabled in FastAPI. No advanced RBAC implemented yet.

============================================================
### 34. KNOWN BUGS / LIMITATIONS
============================================================
1. BLOCKER: `psycopg2` missing, breaking all DB integration.
2. BLOCKER: `pysteps` LK motion tracker import fails due to internal structural issues in `forecast.motion`.
3. HIGH: ML models are completely UNTRAINED.

============================================================
### 35. CURRENT REALITY MATRIX
============================================================
| Capability | Intended | Actually implemented | Tested | Data available | Production-ready? | Status |
|---|---|---|---|---|---|---|
| radar ingestion | Live DWR | Mock / SEVIR | Yes | No | No | MOCK |
| storm detection | 35dBZ Watershed | Simple 35dBZ | Yes | Yes (Synthetic) | No | IMPLEMENTED_AND_VERIFIED |
| H1 (Extrapolation) | PySteps LK | Broken import | No | Yes | No | BROKEN |
| H1 (ML) | Res-UNet | Code Only | Yes | No | No | UNTRAINED |
| alerts | CAP XML | Internal Dicts | Yes | No | No | MOCK |

============================================================
### 36. CURRENT ARCHITECTURE DIAGRAM
============================================================
[PROXY/SYNTHETIC DATA] -> [FASTAPI] -> [BROKEN PYSTEPS / UNTRAINED ML] -> [MOCK ALERTS] -> [CODE_ONLY FRONTEND]

============================================================
### 37. INTENDED ARCHITECTURE (FUTURE / TARGET ARCHITECTURE)
============================================================
[LIVE INSAT/DWR] -> [CELERY WORKERS] -> [POSTGIS] -> [TRAINED RES-UNET] -> [CAP ALERTS] -> [WEBSOCKETS] -> [NEXT.JS UI]

============================================================
### 38. WHAT CHANGED
============================================================
The repository originally housed the NER Landslide system (frozen). The focus has shifted to MoES PS 26084 (Garjana), introduced via the `xDep/DiDi/garjana` dependency directory which has now become the primary codebase.

============================================================
### 39. DO NOT REGRESS
============================================================
- No fabricated metrics (AUC/CSI must be computed dynamically).
- No hindsight leakage (ReplayClock must be strictly enforced).
- Experimental hazards (Hail/Lightning proxies) must remain marked experimental.

============================================================
### 40. NEXT WORK
============================================================
1. **Blockers**: Fix `psycopg2` and `playwright` dependencies. Fix `forecast.motion` PySteps import.
2. **Immediate**: Wire live MOSDAC INSAT-3D credentials to replace SEVIR synthetic data.
3. **Medium-term**: Train the Residual U-Net on real DWR data.

============================================================
### 41. COMMAND REPRODUCTION
============================================================
`cd xDep/DiDi/garjana`
`python3 -m venv venv`
`source venv/bin/activate`
`pip install -r requirements.txt` (Needs `psycopg2` added)
`PYTHONPATH=$(pwd) pytest tests/`

============================================================
### 42. AUDIT EVIDENCE
============================================================
- `xDep/DiDi/garjana/tests/test_leakage.py`: Passed test indicating hindsight protection.
- `xDep/DiDi/garjana/forecast/residual_unet.py`: Contains `class ResidualUNet(nn.Module)`.
- `xDep/DiDi/garjana/db/repo.py`: Contains `import psycopg2` which fails.

============================================================
# EXECUTIVE HANDOFF TO ANOTHER AI
============================================================
Garjana is a convective-scale nowcasting platform targeting MoES PS 26084. What currently exists is a robust architectural skeleton (FastAPI, Redis, PostGIS, Next.js) layered with strict meteorological interfaces (`Observation`, `GridSpec`). 

However, **the ML models are entirely UNTRAINED and the primary advection algorithm (PySteps) is currently BROKEN due to import errors.** 

Data flows asynchronously (in theory) but is currently tested synchronously using SYNTHETIC (SEVIR) or PROXY (IMERG) data. True radar (DWR) integration is missing. 

Key differentiator: The system enforces strict temporal "hindsight leakage" protection using a `ReplayClock`, meaning historical evaluations cannot cheat by looking ahead. 

**DO NOT falsely claim operational AUC or CSI scores.** The models have no weights.
The next engineer MUST fix the Python dependencies (`psycopg2`), repair the `forecast.motion` import, and begin training the `ResidualUNet` on actual meteorological data.

