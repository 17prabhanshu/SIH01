"""NWP Data Provider (GFS / ERA5).

Pulls NWP data (CAPE, CIN, PWAT, shear, freezing level, DCAPE)
for the H3 Outlook INDEX layer using the config favourability rule.
"""
from __future__ import annotations
import datetime
import numpy as np

from core.types import Observation, Fidelity, GridSpec

class NWPProvider:
    def get_h3_outlook(self, t: datetime.datetime, grid_spec: GridSpec) -> Observation:
        """Compute H3 Outlook Index from NWP fields.
        
        Currently mocks data. Real implementation would fetch GFS GRIB,
        extract CAPE/shear, and apply thresholds.
        """
        # Rule-based index in [0, 1]
        h3_index = np.full((grid_spec.ny, grid_spec.nx), 0.5, dtype=np.float32)
        
        return Observation(
            source="gfs:h3_index",
            valid_time=t,
            received_time=datetime.datetime.now(datetime.UTC),
            fidelity=Fidelity.PROXY,
            grid=h3_index
        )
