"""Convective Initiation (CI) detection.

Stage A (T1): Rule-based satellite cooling-rate test (SATCAST/Cb-TRAM tradition).
Stage B (T2): Learned LightGBM classifier.

Thresholds from config/ci_rules.yaml (R14). All NEEDS VERIFICATION.
"""
from __future__ import annotations

import numpy as np

from core.config import Config


def detect_ci_rules(
    ir_tb: np.ndarray | None = None,
    ir_tb_prev: np.ndarray | None = None,
    wv_tb: np.ndarray | None = None,
    dt_minutes: float = 15.0,
) -> dict:
    """Stage A: Rule-based CI detection.

    Tests (from config/ci_rules.yaml):
    1. Cloud-top cooling rate test
    2. IR window temperature test
    3. WV-IR difference test

    Returns dict with ci_detected (bool), ci_probability, ci_pixels.
    """
    try:
        cfg = Config.get("ci_rules")["ci_rules"]
    except (FileNotFoundError, KeyError):
        cfg = {
            "cooling_rate": {"threshold_K_per_15min": -4.0, "min_area_pixels": 5},
            "ir_window": {"max_brightness_temp_K": 235.0},
            "wv_ir_diff": {"min_diff_K": -25.0},
            "require_all": True,
        }

    results = {
        "ci_detected": False,
        "ci_probability": 0.0,
        "ci_pixels": 0,
        "tests_passed": [],
        "tests_failed": [],
    }

    tests_passed = []

    # Test 1: Cooling rate
    if ir_tb is not None and ir_tb_prev is not None:
        cooling_rate = (ir_tb - ir_tb_prev) / (dt_minutes / 15.0)
        cooling_threshold = cfg["cooling_rate"]["threshold_K_per_15min"]
        min_pixels = cfg["cooling_rate"]["min_area_pixels"]

        cooling_pixels = (cooling_rate <= cooling_threshold).sum()
        if cooling_pixels >= min_pixels:
            tests_passed.append("cooling_rate")
            results["ci_pixels"] = int(cooling_pixels)
        else:
            results["tests_failed"].append("cooling_rate")
    else:
        results["tests_failed"].append("cooling_rate_no_data")

    # Test 2: IR window temperature
    if ir_tb is not None:
        ir_threshold = cfg["ir_window"]["max_brightness_temp_K"]
        if ir_tb.min() <= ir_threshold:
            tests_passed.append("ir_window")
        else:
            results["tests_failed"].append("ir_window")

    # Test 3: WV-IR difference
    if wv_tb is not None and ir_tb is not None:
        diff = wv_tb - ir_tb
        diff_threshold = cfg["wv_ir_diff"]["min_diff_K"]
        if diff.min() <= diff_threshold:
            tests_passed.append("wv_ir_diff")
        else:
            results["tests_failed"].append("wv_ir_diff")

    results["tests_passed"] = tests_passed

    # Combine
    require_all = cfg.get("require_all", True)
    n_expected = 3  # Total tests
    n_passed = len(tests_passed)

    if require_all:
        results["ci_detected"] = n_passed >= n_expected
    else:
        results["ci_detected"] = n_passed >= 2

    results["ci_probability"] = n_passed / max(n_expected, 1)

    return results
