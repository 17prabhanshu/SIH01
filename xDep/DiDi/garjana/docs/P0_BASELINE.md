# P0: ARCHITECTURE AND REPOSITORY BASELINE

## REPOSITORY STRUCTURE
The root of the repository (`/Users/prabhanshushekhar/Downloads/xSIH101`) contains a frozen landslide codebase.
The Garjana platform operates entirely within `xDep/DiDi/garjana/`. 
All dependencies, models, and scripts for convective nowcasting are scoped to this directory.

## EXISTING INFRASTRUCTURE
- FastAPI server
- Next.js frontend (scaffolded)
- PostGIS database configuration
- PyTorch UNet (Untrained)
- PySteps extrapolation baseline
- Redis pub/sub stubs

## CURRENT TESTS
- 148 tests in `xDep/DiDi/garjana/tests/`.
- 145 pass.
- 3 fail due to missing dependencies (`psycopg2`, `playwright`) and a broken import in `forecast.motion`.

## STALE/DEAD COMPONENTS
- None explicitly. The Garjana codebase was recently seeded.

## CONFLICTS & IMPLEMENTATION GAPS
- `psycopg2` is missing from the virtual environment, breaking `db.repo`.
- `forecast.motion.estimate_motion_lk` is missing or incorrectly named in `forecast/motion.py`, breaking PySteps verification tests.
- Models have no weights (UNTRAINED).
- Real data connections (MOSDAC, DWR) are missing. 
- The system is relying entirely on synthetic SEVIR data for tests.
