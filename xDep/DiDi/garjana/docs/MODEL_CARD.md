# Garjana Model Card

## H1: Convective Scale Motion Field & Extrapolation
* **Architecture:** PySteps Lucas-Kanade dense optical flow + Semi-Lagrangian extrapolation
* **Baseline:** Eulerian Persistence
* **Ensemble:** N=16 motion field perturbations (R18)
* **Intended Use:** 0-120 minute reflectivity extrapolation

## H2: Convective Initiation (Stage A)
* **Architecture:** Rule-based decision tree (Mecikalski & Bedka proxy)
* **Inputs:** Synthetic TIR/WV cooling rates
* **Output:** 0-180 minute CI probability

## H1-Residual: Learned Corrector (T2 - Frozen)
* **Status:** FROZEN (Tier T2)
* **Architecture:** Residual U-Net
* **Gating (R16):** Model is strictly gated. Must demonstrate holdout CSI >= baseline LK extrapolation to be deployed.
