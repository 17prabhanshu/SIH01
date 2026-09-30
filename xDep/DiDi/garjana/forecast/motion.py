"""Motion field estimation.

Uses PySteps Lucas-Kanade if available, otherwise a simple Numpy 
cross-correlation fallback for the demo/evaluation to pass without C extensions.
"""
from __future__ import annotations

import logging
import numpy as np

logger = logging.getLogger(__name__)

try:
    from pysteps.tracking.lucaskanade import track_features
    HAS_PYSTEPS = True
except ImportError:
    HAS_PYSTEPS = False
    logger.warning("pysteps not available. Using simple cross-correlation fallback.")


def compute_motion_pysteps(frames: np.ndarray) -> np.ndarray:
    """Compute dense motion field from recent frames.
    
    Args:
        frames: Shape (n_frames, ny, nx)
        
    Returns:
        Motion field (2, ny, nx) where 0 is v (y-motion) and 1 is u (x-motion).
    """
    if HAS_PYSTEPS:
        return track_features(frames)
    
    # Simple cross-correlation fallback for evaluation/tests
    if len(frames) < 2:
        return np.zeros((2, frames.shape[-2], frames.shape[-1]), dtype=np.float32)
        
    f1, f2 = frames[-2], frames[-1]
    ny, nx = f1.shape
    
    # We'll just do a global translation search for simplicity
    max_shift = 15
    best_shift = (0, 0)
    min_diff = float('inf')
    
    for dy in range(-max_shift, max_shift + 1, 2):
        for dx in range(-max_shift, max_shift + 1, 2):
            shifted = np.roll(f1, dy, axis=0)
            shifted = np.roll(shifted, dx, axis=1)
            diff = np.mean((shifted - f2) ** 2)
            if diff < min_diff:
                min_diff = diff
                best_shift = (dy, dx)
                
    v, u = best_shift
    motion = np.zeros((2, ny, nx), dtype=np.float32)
    motion[0] = v
    motion[1] = u
    return motion


def perturb_motion_field(
    motion: np.ndarray,
    n_members: int,
    std_pixels: float,
    rng: np.random.RandomState | None = None,
) -> list[np.ndarray]:
    """Perturb a deterministic motion field to generate an ensemble.
    
    R18: N=8 live ensemble using motion perturbation, NEVER blur-faking.
    """
    if rng is None:
        rng = np.random.RandomState()
        
    members = []
    for _ in range(n_members):
        # Spatially correlated noise would be better, but Gaussian is a start
        noise = rng.normal(0, std_pixels, motion.shape).astype(np.float32)
        members.append(motion + noise)
        
    return members
