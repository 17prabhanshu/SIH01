# India Convective Benchmark (ICB)

A versioned set of real Indian convective events for reproducible evaluation.

## Usage

```bash
make benchmark
```

## Events

See `events.yaml` for the event catalogue. Each event includes:
- Radar frames (if available)
- INSAT satellite frames
- Lightning data
- ERA5/GFS environmental fields
- Verification labels
- Metadata and licence notes

## Reproduction

`make benchmark` reproduces all tables and figures from the evaluation.
Results are written to `docs/results/`.
