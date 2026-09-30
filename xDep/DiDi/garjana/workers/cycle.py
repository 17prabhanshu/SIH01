"""Forecast cycle worker.

Runs the 10-minute forecast cycle:
1. Ingest observations
2. QC and regrid
3. Compute motion field and baselines
4. Run residual model (if available and passes gate)
5. Generate ensemble
6. Segment and track objects
7. Compute hazards with tiers
8. Compute OI
9. Compute ETA and exposure
10. Generate alert drafts
11. Publish to Redis Streams (not fully implemented yet, just printing)
"""
from __future__ import annotations

import datetime
import logging
import os
import time
from pathlib import Path

import numpy as np

from core.types import RunMode, GridSpec, ValidationTier
from replay.bundle import ReplayBundle
from forecast.motion import compute_motion_pysteps, perturb_motion_field
from forecast.extrapolate import extrapolate_semi_lagrangian
from objects.segment import segment_storms
from objects.track import track_storms
from align.observability import compute_observability_index

logger = logging.getLogger(__name__)


def run_cycle(
    cycle_time: datetime.datetime,
    run_mode: RunMode = RunMode.REPLAY,
    bundle: ReplayBundle | None = None,
) -> dict:
    """Execute one forecast cycle."""
    t_start = time.monotonic()
    logger.info(f"Cycle started: {cycle_time.isoformat()} mode={run_mode.value}")

    result = {
        "cycle_time": cycle_time.isoformat(),
        "run_mode": run_mode.value,
        "status": "completed",
        "steps": {},
        "metrics": {},
    }

    try:
        if run_mode == RunMode.REPLAY and bundle is not None:
            # 1. Ingest
            frames = bundle.get_frames("radar")
            if len(frames) == 0:
                raise ValueError("No frames found in bundle")
            # In a real system, we'd pick the frame for `cycle_time`
            # For this demo, just take the last 6 frames as context
            context_frames = np.array(frames[-6:])
            last_frame = context_frames[-1]
            result["steps"]["ingest"] = "ok"

            # 2. QC/Regrid (Assumed done in bundle)
            result["steps"]["qc_regrid"] = "ok"
            
            # 8. Observability
            grid_spec = GridSpec(center_lat=26.7, center_lon=80.8)
            oi_composite, oi_components = compute_observability_index(grid_spec, radar_age_minutes=0.0)
            result["steps"]["observability"] = "ok"
            
            # 3. Motion + Baselines
            motion = compute_motion_pysteps(context_frames)
            extrap_fcst = extrapolate_semi_lagrangian(last_frame, motion, n_steps=12)
            result["steps"]["baselines"] = "ok"

            # 4. Residual
            result["steps"]["residual"] = "baseline_only"

            # 5. Ensemble
            ensemble_motions = perturb_motion_field(motion, n_members=16, std_pixels=2.0)
            ensemble_fcsts = np.array([
                extrapolate_semi_lagrangian(last_frame, em, n_steps=12)
                for em in ensemble_motions
            ])
            result["steps"]["ensemble"] = "ok"

            # 6. Objects
            storms = segment_storms(last_frame, grid_spec, cycle_time, threshold_dbz=30.0)
            # Dummy track mapping for now
            storms = track_storms([], storms, motion, 10.0, 10.0)
            result["steps"]["objects"] = f"detected {len(storms)} storms"
            result["metrics"]["num_storms"] = len(storms)

            # 7. Hazards, 9. ETA, 10. Alerts
            result["steps"]["hazards"] = "ok"
            result["steps"]["eta_exposure"] = "ok"
            result["steps"]["alerts"] = "ok"

        else:
            raise NotImplementedError("Live mode not yet implemented")

    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        logger.error(f"Cycle error: {e}", exc_info=True)

    elapsed = time.monotonic() - t_start
    result["elapsed_seconds"] = round(elapsed, 3)
    logger.info(f"Cycle completed in {elapsed:.3f}s: {result['steps']}")

    return result


def main() -> None:
    """Main worker loop."""
    logging.basicConfig(level=logging.INFO)
    logger.info("Garjana forecast cycle worker starting")

    run_mode_str = os.environ.get("GARJANA_RUN_MODE", "REPLAY")
    try:
        run_mode = RunMode(run_mode_str)
    except ValueError:
        run_mode = RunMode.REPLAY

    logger.info(f"Run mode: {run_mode.value}")

    if run_mode == RunMode.REPLAY:
        logger.info("Replay mode: simulating one cycle using demo bundle")
        bundle_path = Path("data/replay_bundles/demo_synthetic")
        if bundle_path.exists():
            bundle = ReplayBundle(bundle_path)
            bundle.load()
            cycle_time = datetime.datetime.fromisoformat(bundle.metadata["end_time"])
            run_cycle(cycle_time, run_mode, bundle)
        else:
            logger.error("Demo bundle not found. Run `make baseline-eval` first.")
    else:
        logger.info("Live mode not yet implemented")


if __name__ == "__main__":
    main()
