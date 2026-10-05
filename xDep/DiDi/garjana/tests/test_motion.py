import pytest
import numpy as np

from forecast.motion import estimate_motion_lk, estimate_motion_vet, perturb_motion_field

def test_estimate_motion_lk_basic():
    # Test fallback simple block-matching
    frame1 = np.zeros((32, 32))
    frame1[10:20, 10:20] = 50.0
    frame2 = np.zeros((32, 32))
    frame2[12:22, 12:22] = 50.0 # moved +2, +2
    
    frames = [frame1, frame2]
    motion = estimate_motion_lk(frames)
    assert motion.shape == (2, 32, 32)
    # The block matching should find some motion, depending on block sizes
    # We just ensure it runs and outputs right shape

def test_estimate_motion_lk_ndarray():
    frames = np.zeros((2, 16, 16))
    motion = estimate_motion_lk(frames)
    assert motion.shape == (2, 16, 16)

def test_estimate_motion_lk_error():
    with pytest.raises(ValueError, match="Need at least 2 frames"):
        estimate_motion_lk([np.zeros((10, 10))])

def test_estimate_motion_vet_error_too_few():
    # Only test if pysteps is installed, otherwise it raises ImportError
    try:
        import pysteps
    except ImportError:
        with pytest.raises(ImportError):
            estimate_motion_vet([np.zeros((10, 10)), np.zeros((10, 10))])
        return

    with pytest.raises(ValueError, match="Need at least 2 frames"):
        estimate_motion_vet([np.zeros((10, 10))])

def test_perturb_motion_field():
    motion = np.zeros((2, 32, 32), dtype=np.float32)
    members = perturb_motion_field(motion, n_members=4, std_pixels=2.0)
    
    assert len(members) == 4
    for m in members:
        assert m.shape == (2, 32, 32)
        assert np.any(m != 0.0) # Should be perturbed
        
    # Check they are different
    assert not np.allclose(members[0], members[1])

def test_perturb_motion_field_rng():
    motion = np.zeros((2, 32, 32), dtype=np.float32)
    rng1 = np.random.RandomState(42)
    rng2 = np.random.RandomState(42)
    
    mem1 = perturb_motion_field(motion, n_members=2, std_pixels=1.0, rng=rng1)
    mem2 = perturb_motion_field(motion, n_members=2, std_pixels=1.0, rng=rng2)
    
    assert np.allclose(mem1[0], mem2[0])
