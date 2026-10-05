"""Synthetic storm data provider.

Generates moving, growing, and decaying synthetic storm cells for testing.
All output is labelled SYNTHETIC (R2).
"""
from __future__ import annotations

import datetime

import numpy as np

from core.types import Fidelity, GridSpec, Observation
from providers.base import BaseProvider


class SyntheticProvider(BaseProvider):
    """Generates synthetic radar-like data for development and testing.

    All data is clearly labelled with fidelity=SYNTHETIC (R2).
    """

    def __init__(self, seed: int = 42) -> None:
        super().__init__(provider_id="synthetic:radar", fidelity=Fidelity.SYNTHETIC)
        self.rng = np.random.RandomState(seed)
        self._frame_idx = 0

    def is_available(self) -> bool:
        return True  # Always available

    def fetch(
        self,
        valid_time: datetime.datetime,
        grid_spec: GridSpec,
    ) -> Observation:
        """Generate a synthetic radar frame with moving/growing cells."""
        grid = self._generate_frame(grid_spec)
        self._frame_idx += 1
        return self._make_observation(
            valid_time=valid_time,
            grid=grid,
            qc={"missing_frac": 0.0, "synthetic": True},
            meta={
                "generator": "SyntheticProvider",
                "seed": 42,
                "frame_idx": self._frame_idx,
            },
        )

    def _generate_frame(
        self,
        grid_spec: GridSpec,
    ) -> np.ndarray:
        """Generate a single frame with Gaussian storm cells."""
        ny, nx = grid_spec.ny, grid_spec.nx
        frame = np.zeros((ny, nx), dtype=np.float32)

        # Number of cells varies
        n_cells = self.rng.randint(2, 6)
        for _ in range(n_cells):
            # Cell center moves over time
            cx = self.rng.uniform(50, nx - 50) + self._frame_idx * 2.0
            cy = self.rng.uniform(50, ny - 50) + self._frame_idx * 1.5
            cx = cx % nx
            cy = cy % ny

            # Cell intensity and size evolve
            peak_dbz = self.rng.uniform(30, 55)
            sigma_x = self.rng.uniform(8, 25)
            sigma_y = self.rng.uniform(8, 25)

            # Growth/decay modulation
            phase = (self._frame_idx % 12) / 12.0
            intensity_mod = np.sin(phase * np.pi)  # Grow then decay
            peak_dbz *= (0.5 + 0.5 * intensity_mod)

            yy, xx = np.mgrid[0:ny, 0:nx]
            cell = peak_dbz * np.exp(
                -((xx - cx) ** 2) / (2 * sigma_x ** 2)
                - ((yy - cy) ** 2) / (2 * sigma_y ** 2)
            )
            frame = np.maximum(frame, cell.astype(np.float32))

        return frame

    def generate_sequence(
        self,
        start_time: datetime.datetime,
        n_frames: int,
        grid_spec: GridSpec,
        interval_minutes: int = 10,
    ) -> list[Observation]:
        """Generate a sequence of synthetic frames."""
        observations = []
        for i in range(n_frames):
            t = start_time + datetime.timedelta(minutes=interval_minutes * i)
            obs = self.fetch(t, grid_spec)
            observations.append(obs)
        return observations
