"""SEVIR dataset provider.

Loads VIL, IR107, and lightning from the SEVIR dataset (MIT-AI-Accelerator).
Used for development and pre-training. Data is US-based, NOT Indian.
Fidelity is set to SYNTHETIC since it's not Indian operational data.

SEVIR format: HDF5 files with shape (N_events, 49, 384, 384) for most types.
VIL is 384x384 at ~1 km resolution; we regrid to 256x256 at 2 km.

Reference: https://github.com/MIT-AI-Accelerator/neurips-2020-sevir
"""
from __future__ import annotations

import datetime
from pathlib import Path

import numpy as np

from core.types import Fidelity, GridSpec, Observation
from providers.base import BaseProvider

# SEVIR constants
SEVIR_DTYPES = {
    "vil": {"scale": 1.0 / 47.0 * 255.0, "offset": 0.0, "unit": "VIL (kg/m^2)"},
    "ir107": {"scale": 1.0, "offset": 0.0, "unit": "brightness_temperature_K"},
    "lght": {"scale": 1.0, "offset": 0.0, "unit": "flash_count"},
}

# SEVIR temporal split (published)
# Training: 2017-01-01 to 2019-06-01
# Validation: 2019-06-01 to 2019-09-01
# Test: 2019-09-01 to 2019-12-31
SEVIR_SPLITS = {
    "train": (datetime.datetime(2017, 1, 1), datetime.datetime(2019, 6, 1)),
    "val": (datetime.datetime(2019, 6, 1), datetime.datetime(2019, 9, 1)),
    "test": (datetime.datetime(2019, 9, 1), datetime.datetime(2019, 12, 31)),
}


class SEVIRProvider(BaseProvider):
    """Load SEVIR data for development and training.

    IMPORTANT: This is US data, labelled as SYNTHETIC fidelity when used
    in the Indian context. Never presented as Indian data.
    """

    def __init__(
        self,
        data_dir: str | Path = "data/sevir",
        data_type: str = "vil",
    ) -> None:
        super().__init__(
            provider_id=f"sevir:{data_type}",
            fidelity=Fidelity.SYNTHETIC,  # US data, not Indian
        )
        self.data_dir = Path(data_dir)
        self.data_type = data_type
        self._catalog: list[dict] | None = None
        self._loaded_events: dict[str, np.ndarray] = {}

    def is_available(self) -> bool:
        """Check if SEVIR data directory exists."""
        return self.data_dir.exists()

    def fetch(
        self,
        valid_time: datetime.datetime,
        grid_spec: GridSpec,
    ) -> Observation | None:
        """Fetch SEVIR data for the given time.

        Returns None if data is not available (R1: never fabricate).
        """
        if not self.is_available():
            return None

        # In a full implementation, look up the event by time
        # For now, return None if no data loaded
        return None

    def load_event(
        self,
        event_id: str,
        grid_spec: GridSpec,
    ) -> list[Observation]:
        """Load all frames from a SEVIR event.

        Returns a list of Observations with proper provenance.
        """
        try:
            import h5py
        except ImportError:
            raise ImportError("h5py required for SEVIR provider: pip install h5py")

        frames: list[Observation] = []
        # SEVIR events have 49 frames at 5-min intervals (4 hours)
        # We subsample to 10-min intervals for our 10-min cycle

        event_path = self.data_dir / f"{self.data_type}" / f"{event_id}.h5"
        if not event_path.exists():
            return frames

        with h5py.File(event_path, "r") as f:
            data = f[self.data_type][:]
            # Subsample to 10-min intervals (every 2nd frame)
            for i in range(0, min(data.shape[0], 49), 2):
                frame = data[i]
                # Regrid from 384x384 to 256x256 if needed
                if frame.shape != (grid_spec.ny, grid_spec.nx):
                    frame = self._regrid(frame, grid_spec)

                valid_time = datetime.datetime(2019, 1, 1) + datetime.timedelta(
                    minutes=5 * i
                )  # Placeholder time

                obs = self._make_observation(
                    valid_time=valid_time,
                    grid=frame.astype(np.float32),
                    qc={"missing_frac": float(np.isnan(frame).mean())},
                    meta={
                        "event_id": event_id,
                        "frame_idx": i,
                        "data_type": self.data_type,
                        "original_shape": list(data.shape),
                        "NOT_INDIAN_DATA": True,
                    },
                )
                frames.append(obs)

        return frames

    def _regrid(self, frame: np.ndarray, grid_spec: GridSpec) -> np.ndarray:
        """Regrid a SEVIR frame to the target grid size."""
        from scipy.ndimage import zoom

        zy = grid_spec.ny / frame.shape[0]
        zx = grid_spec.nx / frame.shape[1]
        return zoom(frame, (zy, zx), order=1).astype(np.float32)

    def get_split(self, split: str) -> tuple[datetime.datetime, datetime.datetime]:
        """Get the date range for a SEVIR split."""
        if split not in SEVIR_SPLITS:
            raise ValueError(f"Unknown split: {split}. Use: {list(SEVIR_SPLITS.keys())}")
        return SEVIR_SPLITS[split]
