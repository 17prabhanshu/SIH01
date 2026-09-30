# Honesty and Transparency Statement (Garjana)

We believe AI nowcasting systems must be fundamentally verifiable, especially for civil defense and life-safety applications. This document discloses every proxy, synthetic generation method, and missing data component used in this evaluation.

## 1. Motion Backends
Because PySteps Lucas-Kanade optical flow relies on C-extensions that fail to compile natively on Apple Silicon without OpenMP interventions, we implemented a pure numpy block-matching cross-correlation fallback.
- **Backend in Use:** The JSON metrics strictly declare `motion_backend`. If `numpy_block_match_fallback` is used, the optical flow is lower-fidelity than production, but it still executes the entire Semi-Lagrangian pipeline.

## 2. Evaluation Data (Synthetic V2)
The previous baseline evaluation was an "inverse crime" (Extrapolation CSI=1.0) because it evaluated extrapolation against purely translating synthetic data using the same mathematical assumptions.
- **Current Data (Synthetic V2):** We developed an independent generator with non-linear motion, rotation, sub-pixel displacement, growth/decay, and speckle noise.
- **Gate Enforcement:** Our scripts explicitly crash if CSI == 1.0 beyond 10 minutes, proving that the evaluation task is sufficiently difficult.

## 3. Real Data Availability
At this stage (Pre-SIH Finale), we do not have access to live IMD DWR radar data.
- **Radar:** Replaced with synthetic grids.
- **INSAT-3DR:** The `insat_mosdac.py` client is built but runs on a fixture since we lack live MOSDAC API keys at build time.
- **Lightning:** We use a proxy tier (`ValidationTier.PROXY`) calculated from VIL proxy when real IITM/ILDN network data is unavailable.

## 4. Hazard Validation Tiers
In compliance with Rule 4 (R4):
- **Heavy Rain** is `VALIDATED` using ensemble Z-R fractions.
- **Extreme Rain ("Cloudburst-type")**, **Hail**, and **Wind** are strictly marked as `EXPERIMENTAL`. The UI badges these appropriately. The system refuses to output a deterministic warning for these hazards.

## 5. Model Gating
The Residual U-Net (H1-Residual) is subjected to a strict R16 gate. As shown in the Evidence Pack, if it fails to surpass the physics baseline (Extrapolation CSI) on a held-out dataset, it is automatically rejected, and the baseline physics are served instead.
