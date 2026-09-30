# Garjana Build Status

*Updated: 2026-09-30*

## Phase Status

| Phase | Status | Date | Notes |
|---|---|---|---|
| P0: Skeleton | **TESTED** | 2026-09-30 | Core types, grids, time, schema have passing tests. Needs end-to-end integration proof. |
| P1: Replay + Baselines | **TESTED** | 2026-09-30 | Baseline eval runs, but GATE IS CIRCULAR (synthetic generation not independent of extrapolation). Needs non-circular test. |
| P2: Residual Model | **CODE_ONLY** | 2026-09-30 | **T2 frozen.** Needs gating test on held-out data. |
| P3: Objects + CI | **TESTED** | 2026-09-30 | Segmenting, tracking, and Stage A CI rules are unit tested, but not wired fully in cycle worker or UI. |
| P4: Hazards + OI | **TESTED** | 2026-09-30 | Hazard logic and OI components tested, but not computed as full grid fields end-to-end. |
| P5: Decision Layer | **TESTED** | 2026-09-30 | ETA and CAP tested in isolation, missing full pipeline execution to Redis/DB. |
| P6: API + Frontend | **CODE_ONLY** | 2026-09-30 | Builds successfully, but `docker compose up` /health fails (Colima down) and Playwright demo script missing. UI is a scaffold without real API wiring. |
| P7: Real Data + ICB | **NOT_STARTED** | 2026-09-30 | Missing real Indian event, INSAT data, and ICB benchmarking. |

## Tier Classification & Honesty Audit

| Tier | Items | Status |
|---|---|---|
| **T0 (must ship)** | P0 skeleton, P1 baselines, H1 extrapolation, objects, hazard tiers+OI, exposure+ETA+CAP, UI | **TESTED (Downgraded)** |
| **T1 (should ship)** | Rule-based CI, degradation modes, OI in UI, Hindi CAP | **TESTED (Downgraded)** |
| **T2 (stretch, FROZEN)** | Learned CI, learned H3, residual U-Net training, ONNX export | **CODE_ONLY, FROZEN** |

### Missing for T0/T1 ACCEPTANCE:
1. **Independent Synthetic Data:** The baseline evaluation gate was circular (scoring 1.0). Requires a synthetic generator independent of the extrapolation code to prove real skill degradation.
2. **End-to-End Pipeline:** Cycle worker stops at segmentation. Must wire hazards, ETA, CAP drafting, and write to PostGIS/Redis Streams.
3. **API & UI Integration:** Need `docker compose up` working, real data flowing from API to UI, and Playwright demo walk screenshots.
4. **Real Indian Event:** T1 requires real INSAT data and a Hindi CAP validation.
5. **Observability Index:** Must be visible in the UI.

## Acceptance Evidence

| Acceptance Test | Command | Evidence File | Status |
|---|---|---|---|
| P0/T1: all tests pass | `pytest tests/` | — | ✅ 126/126 pass |
| P1: baseline-eval | `make baseline-eval` | `eval/baselines.json` | ❌ REJECTED (circular) |
| P1: CSI-vs-lead plot | `make baseline-eval` | `docs/results/csi_vs_lead.png` | ❌ REJECTED (circular) |
| P1: leakage test | `pytest tests/test_leakage.py` | — | ✅ PASS (property tested) |
| End-to-End Cycle | `python -m workers.cycle` | `docs/results/latency.json` | ❌ MISSING EVIDENCE |
| Frontend builds | `npm run build` | — | ✅ PASS |
| Playwright Demo | `make demo` | `docs/results/screens/demo.png` | ❌ NOT STARTED |
