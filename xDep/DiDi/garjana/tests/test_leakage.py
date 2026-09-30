"""Leakage tests to enforce R5: No hindsight leakage.

Feature builders must not use data from the future.
"""
import datetime
import numpy as np
import pytest

from verify.leakage_tests import check_no_future_data
from core.types import Observation, Fidelity
from align.features import build_features


def test_no_hindsight_leakage():
    """Verify that build_features does not use data with valid_time > target_time."""
    start_time = datetime.datetime(2026, 9, 30, 10, 0, tzinfo=datetime.UTC)
    observations = []
    
    # Create 10 frames of observations
    for i in range(10):
        t = start_time + datetime.timedelta(minutes=10 * i)
        obs = Observation(
            source="radar:LKO",
            valid_time=t,
            received_time=t,
            fidelity=Fidelity.SYNTHETIC,
            grid=np.ones((256, 256), dtype=np.float32) * i,
        )
        observations.append(obs)
        
    target_time = start_time + datetime.timedelta(minutes=50) # Frame 5
    
    # Check that shuffling future frames (6-9) doesn't change features at frame 5
    passed = check_no_future_data(
        feature_builder=build_features,
        observations=observations,
        target_time=target_time
    )
    
    assert passed, "R5 Violation: feature builder leaked future data!"
