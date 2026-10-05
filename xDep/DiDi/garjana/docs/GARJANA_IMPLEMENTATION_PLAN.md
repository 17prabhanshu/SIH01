# GARJANA IMPLEMENTATION PLAN
**SIH 2026 | MoES PS 26084 | Convective-Scale Nowcasting System**

## EXECUTIVE GOAL
Build a real, reproducible, research-backed prototype of the Garjana convective nowcasting platform. The system will ingest multi-source weather data, compute optical-flow baselines, run residual ML models, track storms, calculate ETA, and distribute CAP-compliant alerts to a GIS control room.

## CURRENT-STATE SUMMARY
The Garjana codebase resides in `xDep/DiDi/garjana/` alongside a frozen legacy landslide codebase in the root. 
- Fast API, Next.js, and core schemas (Observation, GridSpec) are scaffolded.
- ML models (Residual U-Net) exist as code but are entirely UNTRAINED.
- Tests (148) mostly pass, but critical dependencies (`psycopg2`, `playwright`) are missing, breaking DB integration.
- The `pysteps` LK motion tracking baseline is BROKEN due to an `ImportError`.
- Data flows use SYNTHETIC (SEVIR) and PROXY (IMERG) sources; no live Indian DWR radar or MOSDAC INSAT data is wired.

## TARGET-STATE SUMMARY
An operational, end-to-end pipeline that ingests actual MOSDAC/Indian radar data, correctly calculates the Lucas-Kanade optical flow baseline, runs a trained PyTorch U-Net for convective forecasting up to 3 hours ahead, outputs verifiable performance metrics (CSI, FAR), and visualizes the results on a Next.js Control Room without hindsight leakage.

## ARCHITECTURE
`[LIVE DWR / INSAT] -> [FastAPI Ingest] -> [QC/Align] -> [PySteps Extrapolation + Res-UNet ML] -> [Hazard/ETA Engine] -> [PostGIS] -> [Next.js Control Room]`

## CRITICAL PATH & DEPENDENCY GRAPH
`P0 (Baseline)` -> `P1 (Contracts)` -> `P2 (Replay/Baselines)` -> `P3 (Radar)` -> `P9 (H1 ML)` -> `P15 (Benchmark)`
*Parallel Streams*: Frontend (P17), Database (P22), ALerts (P14).

---

## PHASES

### P0 — ARCHITECTURE AND REPOSITORY BASELINE
**Objective**: Establish truth, locate code, freeze legacy.
**Files**: `docs/P0_BASELINE.md`
**Acceptance**: Baseline documented, blockers identified.

### P1 — CORE CONTRACTS
**Objective**: Solidify data structures (Observation, GridSpec).
**Acceptance**: Pydantic schemas validate correctly.

### P2 — REPLAY + BASELINES FIRST
**Objective**: Fix the `pysteps` LK baseline and verify metric generation.
**Blocker**: `ImportError: cannot import name 'estimate_motion_lk'`.
**Acceptance**: `pytest tests/test_metrics.py` passes. Optical flow extrapolated.

### P3 — RADAR PIPELINE
**Objective**: Ingest radar proxy data (IMERG) and prepare for live DWR.
**Acceptance**: Tensors align to 2km standard grids.

### P4 — INSAT PIPELINE
**Objective**: MOSDAC provider for INSAT-3D.
**Acceptance**: IR cooling rates extractable.

### P5 — LIGHTNING PIPELINE
**Objective**: Proxy lightning assimilation.
**Acceptance**: Flash density grid overlays properly.

### P6 — NWP / ENVIRONMENT PIPELINE
**Objective**: GFS/ERA5 environmental variables (CAPE, CIN).
**Acceptance**: Spatial alignment works.

### P7 — QC / ALIGNMENT / OBSERVABILITY
**Objective**: Construct the Observability Index (OI) and mask missing data.
**Acceptance**: OI explicitly generated per grid cell.

### P8 — STORM DETECTION AND TRACKING
**Objective**: Connected components and lifecycle events.
**Acceptance**: 35dBZ cells tracked across frames.

### P9 — H1: 0–2h FORECASTING (ML)
**Objective**: Train Residual U-Net on radar/SEVIR.
**Acceptance**: ML model beats or matches PySteps baseline (CSI). Ablation tests pass.

### P10 — H2: CONVECTIVE INITIATION
**Objective**: Detect pre-radar cooling via LightGBM.
**Acceptance**: Model predicts CI lead-time > 15m.

### P11 — H3: 2–6h OUTLOOK
**Objective**: Coarse environmental favourability.
**Acceptance**: Distinct outlook layers generated.

### P12 — MULTI-HAZARD LAYER
**Objective**: Map reflectivity to Hail/Wind/Heavy Rain.
**Acceptance**: Experimental proxies documented.

### P13 — ETA + EXPOSURE
**Objective**: Calculate p10/p90 storm arrival at critical assets.
**Acceptance**: PostGIS intersections return valid times.

### P14 — ALERTS + CAP
**Objective**: Generate CAP 1.2 XML.
**Acceptance**: Valid XML output.

### P15 — VERIFICATION + BENCHMARK
**Objective**: ICB (India Convective Benchmark).
**Acceptance**: `benchmark_report.json` produced without leakage.

### P16 — API + STREAMING
**Objective**: REST endpoints and WebSockets.
**Acceptance**: `/nowcast` returns 200 OK.

### P17 — FRONTEND / CONTROL ROOM
**Objective**: Next.js GIS UI.
**Acceptance**: UI polls API and renders map layers.

### P18 — REAL INDIAN DATA INTEGRATION
**Objective**: Wire actual credentials.
**Acceptance**: Live mode works.

### P19 — HARDENING / PERFORMANCE
**Objective**: Optimization.
**Acceptance**: Latency < 5000ms.

### P20 — FINAL DEMO / AUDIT
**Objective**: Reproducible demonstration.
**Acceptance**: End-to-end execution.

