"""Script to build the synthetic demo replay bundle.

This prepares a REPLAY bundle with synthetic storm data so the UI
can run completely offline (R15).
"""
from __future__ import annotations

import datetime
import logging
import os
import shutil
import numpy as np
from pathlib import Path

from core.types import GridSpec
from providers.synthetic import SyntheticProvider
from replay.bundle import ReplayBundle
from align.features import build_features
from forecast.motion import compute_motion_pysteps, perturb_motion_field
from forecast.extrapolate import extrapolate_semi_lagrangian

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def build_synthetic_bundle(out_dir: str | Path):
    out_dir = Path(out_dir)
    if out_dir.exists():
        shutil.rmtree(out_dir)
        
    bundle = ReplayBundle(out_dir)
    
    # 2 hours of data (12 frames) at 10-minute intervals
    start_time = datetime.datetime(2026, 9, 30, 10, 0, tzinfo=datetime.UTC)
    n_frames = 12
    grid_spec = GridSpec(center_lat=26.76, center_lon=80.88, radar_id="SYNTH_LKO")
    
    logger.info(f"Generating {n_frames} synthetic frames...")
    provider = SyntheticProvider(seed=42)
    observations = provider.generate_sequence(
        start_time=start_time,
        n_frames=n_frames,
        grid_spec=grid_spec,
    )
    
    # Extract radar grids
    radar_grids = []
    for obs in observations:
        if obs.grid is not None:
            radar_grids.append(obs.grid)
            
    # Add to bundle
    bundle.add_frames("radar", radar_grids)
    bundle.set_metadata(
        event_id="demo_synthetic",
        start_time=start_time,
        end_time=observations[-1].valid_time,
        domain="SYNTH_LKO",
        sources=["radar"],
        fidelity="synthetic"
    )
    
    # Compute baseline forecast for each frame (starting from frame 6 to have context)
    for i in range(5, n_frames):
        context = np.array(radar_grids[i-5:i+1])
        motion = compute_motion_pysteps(context)
        
        # 12 steps (2 hours) deterministic extrapolation
        extrap_fcst = extrapolate_semi_lagrangian(context[-1], motion, n_steps=12)
        
        # N=16 ensemble (R18)
        ensemble_motions = perturb_motion_field(motion, n_members=16, std_pixels=2.0)
        ensemble_fcsts = []
        for em in ensemble_motions:
            ensemble_fcsts.append(extrapolate_semi_lagrangian(context[-1], em, n_steps=12))
            
        # Add to bundle
        t_str = observations[i].valid_time.isoformat()
        forecasts_dir = bundle.bundle_dir / "forecasts"
        forecasts_dir.mkdir(parents=True, exist_ok=True)
        np.save(forecasts_dir / f"extrap_{t_str}.npy", extrap_fcst)
        np.save(forecasts_dir / f"ensemble_{t_str}.npy", np.array(ensemble_fcsts))
        
    bundle.save()
    logger.info(f"Bundle saved to {out_dir}")

if __name__ == "__main__":
    build_synthetic_bundle("data/replay_bundles/demo_synthetic")
