"""Lightning hazard assessment.

P(>=1 flash in 3 km cell in next 60 min) from radar VIL/echo-top,
IR Tb, current flash rate & jump (Schultz-style), CAPE.

Tier: validated if real lightning obs exist, else proxy.
"""
from __future__ import annotations

import numpy as np

from core.config import Config
from core.types import HazardValue, ValidationTier


def compute_lightning_hazard(
    vil: np.ndarray | None,
    flash_rate: float = 0.0,
    flash_rate_prev: float = 0.0,
    ir_tb: np.ndarray | None = None,
    cape: float = 0.0,
    has_real_lightning: bool = False,
    lead_min: int = 60,
    storm_id: str | None = None,
    oi_summary: float = 0.5,
) -> HazardValue:
    """Compute lightning hazard probability.

    Args:
        vil: VIL field or scalar.
        flash_rate: Current flash rate (flashes/min).
        flash_rate_prev: Previous flash rate.
        ir_tb: IR brightness temperature.
        cape: CAPE value (J/kg).
        has_real_lightning: Whether real lightning obs are used.
        lead_min: Forecast lead time.
        storm_id: Associated storm ID.
        oi_summary: Observability Index.
    """
    try:
        cfg = Config.get("thresholds")
        ltg_cfg = cfg.get("hazard_thresholds", {}).get("lightning", {})
        jump_factor = ltg_cfg.get("flash_rate_jump_factor", 2.0)
    except FileNotFoundError:
        jump_factor = 2.0

    # Base probability from VIL
    prob = 0.0
    if vil is not None:
        mean_vil = float(np.mean(vil)) if isinstance(vil, np.ndarray) else float(vil)
        prob += np.clip(mean_vil / 40.0, 0.0, 0.4)  # VIL contribution

    # Lightning jump detection (Schultz-style)
    if flash_rate_prev > 0 and flash_rate > flash_rate_prev * jump_factor:
        prob += 0.3
    elif flash_rate > 0:
        prob += 0.1

    # CAPE contribution
    if cape > 1000:
        prob += np.clip((cape - 1000) / 3000, 0.0, 0.2)

    # IR contribution (cold cloud tops)
    if ir_tb is not None:
        min_tb = float(np.min(ir_tb)) if isinstance(ir_tb, np.ndarray) else float(ir_tb)
        if min_tb < 220:
            prob += 0.1

    prob = float(np.clip(prob, 0.0, 1.0))

    # Lead time decay
    prob *= max(0.2, 1.0 - lead_min / 180.0)

    tier = ValidationTier.VALIDATED if has_real_lightning else ValidationTier.PROXY

    return HazardValue(
        hazard="lightning",
        value=round(prob, 3),
        unit="probability",
        validation_tier=tier,
        method_version="v1.0_schultz_proxy",
        oi_summary=oi_summary,
        lead_min=lead_min,
        storm_id=storm_id,
    )
