"""Synthetic v2 data generator for honest baseline evaluation.

This generator produces radar-like fields that are INDEPENDENT of the
semi-Lagrangian advection code. It features sub-pixel motion,
random acceleration, growth/decay, rotation, and noise.
"""
from __future__ import annotations

import datetime
import numpy as np
from scipy import ndimage

from core.types import GridSpec, Observation, Fidelity


class SyntheticV2Provider:
    """Generates rigorous synthetic data (no inverse crime)."""
    def __init__(self, seed: int = 42):
        self.rng = np.random.RandomState(seed)
        self.cells = []
        self.time_idx = 0
        
    def _init_cells(self, n_cells: int, grid_spec: GridSpec):
        ny, nx = grid_spec.ny, grid_spec.nx
        for _ in range(n_cells):
            self.cells.append({
                "y": self.rng.uniform(50, ny - 50),
                "x": self.rng.uniform(50, nx - 50),
                "vy": self.rng.uniform(-3, 3), # pixels per frame
                "vx": self.rng.uniform(-3, 3),
                "ay": self.rng.uniform(-0.1, 0.1), # acceleration
                "ax": self.rng.uniform(-0.1, 0.1),
                "zmax": self.rng.uniform(35, 55),
                "z_growth": self.rng.uniform(-0.5, 1.0),
                "sigma_x": self.rng.uniform(10, 20),
                "sigma_y": self.rng.uniform(10, 20),
                "theta": self.rng.uniform(0, 2 * np.pi), # rotation
                "dtheta": self.rng.uniform(-0.05, 0.05),
            })
            
    def _generate_frame(self, grid_spec: GridSpec) -> np.ndarray:
        ny, nx = grid_spec.ny, grid_spec.nx
        frame = np.zeros((ny, nx), dtype=np.float32)
        
        yy, xx = np.mgrid[0:ny, 0:nx]
        
        for c in self.cells:
            # Update kinematics
            c["y"] += c["vy"]
            c["x"] += c["vx"]
            c["vy"] += c["ay"]
            c["vx"] += c["ax"]
            c["theta"] += c["dtheta"]
            c["zmax"] += c["z_growth"]
            
            # Bound properties
            c["zmax"] = np.clip(c["zmax"], 0, 70)
            c["sigma_x"] = np.clip(c["sigma_x"] + self.rng.uniform(-0.5, 0.5), 5, 30)
            c["sigma_y"] = np.clip(c["sigma_y"] + self.rng.uniform(-0.5, 0.5), 5, 30)
            
            # Wrap around
            c["y"] %= ny
            c["x"] %= nx
            
            # Oriented Gaussian
            cos_t = np.cos(c["theta"])
            sin_t = np.sin(c["theta"])
            
            x0 = xx - c["x"]
            y0 = yy - c["y"]
            
            x_rot = x0 * cos_t - y0 * sin_t
            y_rot = x0 * sin_t + y0 * cos_t
            
            blob = c["zmax"] * np.exp(
                -(x_rot**2 / (2 * c["sigma_x"]**2) + y_rot**2 / (2 * c["sigma_y"]**2))
            )
            frame = np.maximum(frame, blob)
            
        # Add speckle noise
        noise = self.rng.normal(0, 2, (ny, nx))
        frame = np.clip(frame + noise, 0, None)
        
        # Add ground clutter (static)
        clutter = np.zeros((ny, nx))
        clutter[ny//2-10:ny//2+10, nx//2-10:nx//2+10] = self.rng.uniform(10, 40, (20, 20))
        frame = np.maximum(frame, clutter)
        
        # Missing data patch (occasional)
        if self.rng.rand() < 0.1:
            px, py = self.rng.randint(0, nx-50), self.rng.randint(0, ny-50)
            frame[py:py+50, px:px+50] = np.nan
            
        return frame.astype(np.float32)

    def generate_sequence(
        self,
        start_time: datetime.datetime,
        n_frames: int,
        grid_spec: GridSpec,
    ) -> list[Observation]:
        """Generate rigorous synthetic sequence."""
        if not self.cells:
            self._init_cells(self.rng.randint(3, 8), grid_spec)
            
        obs_list = []
        for i in range(n_frames):
            frame = self._generate_frame(grid_spec)
            t = start_time + datetime.timedelta(minutes=10 * i)
            obs = Observation(
                source="radar:SYNTH_V2",
                valid_time=t,
                received_time=t,
                fidelity=Fidelity.SYNTHETIC,
                grid=frame,
            )
            obs_list.append(obs)
            self.time_idx += 1
            
        return obs_list
