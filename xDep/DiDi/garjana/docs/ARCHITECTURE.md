# Garjana System Architecture

This document mirrors the reference architecture (Sections 3–5 of the spec).

## Layered Architecture

```
L7  PRESENTATION   Next.js + MapLibre
L6  SERVICES       FastAPI REST + WebSocket
L5  DECISION       Exposure, ETA, Severity, CAP, Delivery
L4  HAZARDS        Lightning, Rain, Hail, Wind (with tiers)
L3  FORECAST       H1 Advect&Correct, H2 Initiation, H3 Outlook
L2  OBJECTS        Segmentation, Tracking, Lifecycle
L1  ALIGNMENT      QC, Regrid, Time-sync, OI, Feature Store
L0  PROVIDERS      Radar, INSAT, Lightning, NWP, DEM, Exposure
```

## Design Principles

1. Provider pattern everywhere
2. Provenance is data
3. Advect first, learn the residual
4. Data availability ≠ model uncertainty
5. Honest tiers
6. Everything replayable

## Grid & Cadence

- 256×256 cells at 2 km per radar domain
- 10-minute cycle matching IMD DWR
- 6-frame context (60 min), 12-step forecast (120 min)

See the full spec for detailed component descriptions.
