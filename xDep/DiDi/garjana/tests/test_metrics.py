"""Unit tests for verification metrics.

Hand-computed test cases: perfect forecast, all-miss, all-false-alarm,
one-pixel displacement for FSS.  If these fail, everything downstream
is meaningless.
"""
from __future__ import annotations

import numpy as np
import pytest

from verify.metrics import (
    brier_score,
    compute_all_metrics,
    contingency_table,
    csi,
    far,
    fss,
    hss,
    pod,
    reliability_diagram,
)

# ── Contingency table helpers ─────────────────────────────────────────

class TestContingencyTable:
    """Hand-computed contingency tables."""

    def test_perfect_forecast(self):
        obs = np.array([[0, 40], [40, 0]], dtype=np.float32)
        ct = contingency_table(obs, obs, threshold=30.0)
        assert ct["hits"] == 2
        assert ct["misses"] == 0
        assert ct["false_alarms"] == 0
        assert ct["correct_negatives"] == 2

    def test_all_miss(self):
        obs = np.array([[40, 40], [40, 40]], dtype=np.float32)
        fcast = np.zeros((2, 2), dtype=np.float32)
        ct = contingency_table(fcast, obs, threshold=30.0)
        assert ct["hits"] == 0
        assert ct["misses"] == 4
        assert ct["false_alarms"] == 0

    def test_all_false_alarm(self):
        obs = np.zeros((2, 2), dtype=np.float32)
        fcast = np.full((2, 2), 40.0, dtype=np.float32)
        ct = contingency_table(fcast, obs, threshold=30.0)
        assert ct["hits"] == 0
        assert ct["misses"] == 0
        assert ct["false_alarms"] == 4


# ── Categorical metrics ────────────────────────────────────────────

class TestCSI:
    def test_perfect(self):
        ct = {"hits": 10, "misses": 0, "false_alarms": 0, "correct_negatives": 90}
        assert csi(ct) == pytest.approx(1.0)

    def test_zero(self):
        ct = {"hits": 0, "misses": 5, "false_alarms": 5, "correct_negatives": 90}
        assert csi(ct) == pytest.approx(0.0)

    def test_hand_computed(self):
        # hits=3, misses=2, fa=1 => CSI = 3/(3+2+1) = 0.5
        ct = {"hits": 3, "misses": 2, "false_alarms": 1, "correct_negatives": 94}
        assert csi(ct) == pytest.approx(0.5)


class TestPOD:
    def test_perfect(self):
        ct = {"hits": 10, "misses": 0, "false_alarms": 0, "correct_negatives": 90}
        assert pod(ct) == pytest.approx(1.0)

    def test_half(self):
        ct = {"hits": 5, "misses": 5, "false_alarms": 0, "correct_negatives": 90}
        assert pod(ct) == pytest.approx(0.5)


class TestFAR:
    def test_perfect(self):
        ct = {"hits": 10, "misses": 0, "false_alarms": 0, "correct_negatives": 90}
        assert far(ct) == pytest.approx(0.0)

    def test_all_false_alarm(self):
        ct = {"hits": 0, "misses": 0, "false_alarms": 10, "correct_negatives": 90}
        assert far(ct) == pytest.approx(1.0)


class TestHSS:
    def test_perfect(self):
        ct = {"hits": 10, "misses": 0, "false_alarms": 0, "correct_negatives": 90}
        assert hss(ct) == pytest.approx(1.0)

    def test_no_skill(self):
        # Random-like performance
        ct = {"hits": 1, "misses": 9, "false_alarms": 9, "correct_negatives": 81}
        assert hss(ct) == pytest.approx(0.0, abs=0.05)


# ── FSS ──────────────────────────────────────────────────────────

class TestFSS:
    def test_perfect(self):
        field = np.zeros((32, 32), dtype=np.float32)
        field[10:20, 10:20] = 40.0
        val = fss(field, field, threshold=30.0, scale=5)
        assert val == pytest.approx(1.0)

    def test_empty_both(self):
        field = np.zeros((32, 32), dtype=np.float32)
        val = fss(field, field, threshold=30.0, scale=5)
        assert val == pytest.approx(1.0)  # Both empty → perfect

    def test_one_pixel_displacement(self):
        """A 1-pixel shift should score high at large scale, lower at scale 1."""
        obs = np.zeros((32, 32), dtype=np.float32)
        obs[15, 15] = 40.0
        pred = np.zeros((32, 32), dtype=np.float32)
        pred[15, 16] = 40.0  # 1 pixel east

        fss_small = fss(pred, obs, threshold=30.0, scale=1)
        fss_big = fss(pred, obs, threshold=30.0, scale=11)
        assert fss_big > fss_small  # FSS improves with scale

    def test_total_miss(self):
        obs = np.zeros((32, 32), dtype=np.float32)
        obs[5:10, 5:10] = 40.0
        pred = np.zeros((32, 32), dtype=np.float32)
        pred[25:30, 25:30] = 40.0  # Far away

        val = fss(pred, obs, threshold=30.0, scale=1)
        assert val < 0.1  # Should be very low at scale 1


# ── Probabilistic ───────────────────────────────────────────────

class TestBrierScore:
    def test_perfect(self):
        probs = np.array([1.0, 0.0, 1.0, 0.0])
        obs = np.array([1.0, 0.0, 1.0, 0.0])
        assert brier_score(probs, obs) == pytest.approx(0.0)

    def test_worst(self):
        probs = np.array([0.0, 1.0])
        obs = np.array([1.0, 0.0])
        assert brier_score(probs, obs) == pytest.approx(1.0)

    def test_climatology(self):
        probs = np.full(100, 0.5)
        obs = np.concatenate([np.ones(50), np.zeros(50)])
        assert brier_score(probs, obs) == pytest.approx(0.25)


class TestReliabilityDiagram:
    def test_returns_bins(self):
        probs = np.random.rand(100)
        obs = (probs > 0.5).astype(float)
        result = reliability_diagram(probs, obs, n_bins=5)
        assert len(result["bin_centers"]) == 5
        assert len(result["counts"]) == 5
        assert "brier_score" in result


# ── Integration ──────────────────────────────────────────────────

class TestComputeAllMetrics:
    def test_returns_all_thresholds(self):
        rng = np.random.RandomState(42)
        pred = rng.uniform(0, 50, (64, 64)).astype(np.float32)
        obs = rng.uniform(0, 50, (64, 64)).astype(np.float32)
        result = compute_all_metrics(pred, obs, thresholds=[20.0, 30.0, 40.0])
        assert "threshold_20.0" in result
        assert "threshold_30.0" in result
        assert "threshold_40.0" in result
        assert "csi" in result["threshold_20.0"]
        assert "fss" in result["threshold_20.0"]
