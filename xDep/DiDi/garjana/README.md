# GARJANA (गर्जना) — Convective-Scale Nowcasting

**SIH 2026 · PS 26084 (MoES) · Team ctrl shift n**

> Garjana is an observability-aware convective nowcasting system: it fuses Indian radar,
> INSAT and lightning into one 2 km grid, forecasts in three physically honest horizons
> out to 6 hours, states exactly how well it can see each region, verifies itself
> continuously against baselines, and turns forecasts into human-approved, CAP-ready
> impact alerts.

## Quick Start (5 commands)

```bash
# 1. Clone and enter
git clone <repo-url> && cd garjana

# 2. Start infrastructure
docker compose up -d

# 3. Install Python dependencies
pip install -e ".[dev,train]"

# 4. Run tests
make test

# 5. Run the demo (replay mode, no internet needed)
make demo
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system design.

## Four Pillars

1. **See** — Real multi-source ingestion with provenance + Observability Index
2. **Predict** — Three horizons: Advect & Correct (0–2h), Initiation (0–3h), Environment Outlook (2–6h)
3. **Prove** — Live verification scoreboard vs persistence/optical-flow; open India Convective Benchmark
4. **Warn** — Tiered hazards, probabilistic ETA, exposure-aware, human-in-the-loop CAP alerts

## Key Features

- **Observability Index**: Shows where the system can and cannot see (radar range, beam blockage, satellite geometry, lightning coverage, data staleness)
- **Honest tiers**: Every hazard carries a validation tier (validated / experimental / environment_only / proxy)
- **No fabricated data**: Every number comes from computation, never from fabrication (R1)
- **Provenance everywhere**: Every data array carries source, timing, fidelity, and QC flags (R2)
- **Graceful degradation**: Explicit state machine (FULL → NO_LIGHTNING → RADAR_SAT → RADAR_ONLY → SAT_ONLY → BASELINE)

## Project Structure

```
garjana/
├── config/          # All thresholds and constants (YAML)
├── garjana/         # Python package
│   ├── core/        # Types, time, grid, provenance, config
│   ├── providers/   # Data source adapters
│   ├── qc/          # Quality control
│   ├── align/       # Regrid, timesync, features, observability
│   ├── objects/     # Storm segmentation, tracking, lifecycle
│   ├── forecast/    # Motion, extrapolation, U-Net, ensemble, CI, outlook
│   ├── hazards/     # Lightning, rain, hail, wind with tiers
│   ├── decision/    # Exposure, ETA, severity, CAP, delivery
│   ├── verify/      # Metrics, baselines, benchmark, leakage tests
│   ├── replay/      # Clock, bundle
│   ├── api/         # FastAPI REST + WebSocket
│   ├── workers/     # Ingest, cycle, alert workers
│   └── db/          # Schema, repository
├── train/           # Training scripts
├── benchmark/       # India Convective Benchmark (ICB)
├── frontend/        # Next.js app
├── tests/           # Test suite
├── docs/            # Documentation
└── docker-compose.yml
```

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Full system architecture
- [STATUS.md](docs/STATUS.md) — Phase completion log
- [HONESTY.md](docs/HONESTY.md) — Non-native data disclosure
- [DATA_ACCESS.md](docs/DATA_ACCESS.md) — Data access status
- [LICENSES.md](docs/LICENSES.md) — Third-party licence tracker

## Licence

MIT
