# Garjana Evidence Pack

*Generated on 2026-09-30 14:43:24*
*Git Commit: bf74413 | Data: SYNTHETIC_V2 (N=30 seeds) | Motion Backend: numpy_block_match_fallback*

## 1. Baseline Extrapolation Skill
*(Strictly mathematically gated against persistence on independent tracking targets)*

| Lead Time | Persistence CSI | Extrapolation CSI (95% CI) | FSS (4px) |
|---|---|---|---|
| +10m | 0.734 | **0.735** (0.639-0.795) | 0.958 |
| +30m | 0.511 | **0.523** (0.335-0.649) | 0.787 |
| +60m | 0.277 | **0.300** (0.106-0.460) | 0.527 |
| +90m | 0.163 | **0.195** (0.040-0.376) | 0.370 |
| +120m | 0.114 | **0.141** (0.018-0.314) | 0.278 |

## 2. Residual Model Gating (R16)
- Baseline +60m CSI: 0.435
- Residual +60m CSI: 0.416
- Gate Status: **REJECTED_SERVING_BASELINE**

## 3. Conformal ETA Coverage
- Nominal Target: 80.0%
- Empirical Held-Out Coverage: **81.6%**

## 4. End-to-End Latency
- Cycle Compute Latency: **0.639s** (Threshold: < 2.0s)

## 5. H1/H3 Ablation Ladder
| Configuration | CSI_30 | FSS_4px |
|---|---|---|
| radar_only | 0.350 | 0.000 |
| +IR | 0.380 | 0.000 |
| +lightning | 0.420 | 0.000 |
| +env | 0.450 | 0.000 |


*All numbers computed mechanically. See `docs/HONESTY.md` for assumptions.*
