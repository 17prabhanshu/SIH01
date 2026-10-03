"""Motion field estimation using optical flow.

Primary: pysteps Lucas-Kanade (or DARTS).
The motion field drives both extrapolation and ensemble perturbation.
"""
from __future__ import annotations

import numpy as np


def estimate_motion_lk(
    frames: list[np.ndarray] | np.ndarray,
    **kwargs,
) -> np.ndarray:
    """Estimate motion field using pysteps Lucas-Kanade optical flow.

    Falls back to simple cross-correlation if pysteps is not installed.

    Args:
        frames: List of 2D arrays (most recent last), at least 2 frames.
        **kwargs: Additional arguments for pysteps.

    Returns:
        Motion field of shape (2, ny, nx) in pixels/timestep.
    """
    if isinstance(frames, np.ndarray) and frames.ndim == 3:
        frame_list = [frames[i] for i in range(frames.shape[0])]
    else:
        frame_list = list(frames)

    if len(frame_list) < 2:
        raise ValueError("Need at least 2 frames for motion estimation")

    try:
        from pysteps.motion.lucaskanade import dense_lucaskanade
        stack = np.stack(frame_list, axis=0)
        return dense_lucaskanade(stack, **kwargs)
    except ImportError:
        print("pysteps not available. Using simple cross-correlation fallback.")

    # Fallback: simple block-matching cross-correlation
    prev_frame = frame_list[-2].astype(np.float32)
    curr_frame = frame_list[-1].astype(np.float32)
    ny, nx = curr_frame.shape
    motion = np.zeros((2, ny, nx), dtype=np.float32)

    block_size = 16
    search_range = 8

    for iy in range(0, ny, block_size):
        for ix in range(0, nx, block_size):
            by = min(iy + block_size, ny)
            bx = min(ix + block_size, nx)
            block = curr_frame[iy:by, ix:bx]
            if block.std() < 1e-6:
                continue

            best_dy, best_dx = 0, 0
            best_corr = -1.0

            for dy in range(-search_range, search_range + 1, 2):
                for dx in range(-search_range, search_range + 1, 2):
                    sy = max(0, iy + dy)
                    sx = max(0, ix + dx)
                    ey = min(ny, by + dy)
                    ex = min(nx, bx + dx)
                    if ey - sy < 4 or ex - sx < 4:
                        continue

                    h = min(by - iy, ey - sy)
                    w = min(bx - ix, ex - sx)
                    ref = prev_frame[sy:sy+h, sx:sx+w]
                    tgt = block[:h, :w]

                    if ref.shape != tgt.shape or ref.size == 0:
                        continue

                    corr = np.corrcoef(ref.ravel(), tgt.ravel())[0, 1]
                    if not np.isnan(corr) and corr > best_corr:
                        best_corr = corr
                        best_dy, best_dx = dy, dx

            motion[0, iy:by, ix:bx] = best_dy
            motion[1, iy:by, ix:bx] = best_dx

    return motion


def estimate_motion_vet(
    frames: list[np.ndarray],
    **kwargs,
) -> np.ndarray:
    """Estimate motion field using pysteps VET (Variational Echo Tracking).

    Args:
        frames: List of 2D arrays (most recent last).
        **kwargs: Additional arguments for pysteps.

    Returns:
        Motion field of shape (2, ny, nx) in pixels/timestep.
    """
    try:
        from pysteps.motion.vet import vet
    except ImportError:
        raise ImportError("pysteps required: pip install pysteps")

    if len(frames) < 2:
        raise ValueError("Need at least 2 frames for motion estimation")

    stack = np.stack(frames, axis=0)
    motion = vet(stack, **kwargs)
    return motion


def perturb_motion_field(
    motion: np.ndarray,
    n_members: int = 8,
    std_pixels: float = 2.0,
    rng: np.random.RandomState | None = None,
) -> list[np.ndarray]:
    """Generate ensemble of perturbed motion fields.

    R18: Default live ensemble N=8 with motion-field perturbation.
    Never fake an ensemble with blurring.

    Args:
        motion: Base motion field (2, ny, nx)
        n_members: Number of ensemble members (default 8 for live)
        std_pixels: Standard deviation of perturbation in pixels/step
        rng: Random state for reproducibility

    Returns:
        List of perturbed motion fields.
    """
    if rng is None:
        rng = np.random.RandomState(0)

    members = []
    for _ in range(n_members):
        perturbation = rng.normal(0, std_pixels, size=motion.shape).astype(motion.dtype)
        # Apply spatially smooth perturbation (Gaussian filter)
        from scipy.ndimage import gaussian_filter
        perturbation[0] = gaussian_filter(perturbation[0], sigma=10)
        perturbation[1] = gaussian_filter(perturbation[1], sigma=10)
        # Scale back to desired std
        for d in range(2):
            current_std = perturbation[d].std()
            if current_std > 0:
                perturbation[d] *= std_pixels / current_std

        members.append(motion + perturbation)

    return members
