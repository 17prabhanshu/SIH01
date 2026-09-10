import math
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class TemporalTrend(Enum):
    STABLE = "STABLE"
    INCREASING = "INCREASING"
    ACCELERATING = "ACCELERATING"
    DECREASING = "DECREASING"
    RAPID_CHANGE = "RAPID_CHANGE"

@dataclass
class TemporalProfile:
    delta_24h: Optional[float]
    delta_72h: Optional[float]
    delta_7d: Optional[float]
    mean_val: float
    max_val: float
    slope: float
    acceleration: float
    change_points: List[datetime]
    trend: TemporalTrend

class TemporalAnalyzer:
    def __init__(self, cusum_threshold: float = 3.0, cusum_drift: float = 0.5):
        self.cusum_threshold = cusum_threshold
        self.cusum_drift = cusum_drift

    def compute_delta(self, data: List[Tuple[datetime, float]], hours: int) -> Optional[float]:
        if not data:
            return None
        latest_time, latest_val = data[-1]
        target_time = latest_time - timedelta(hours=hours)
        
        # Find the closest data point before or at target_time
        past_val = None
        for t, v in reversed(data):
            if t <= target_time:
                past_val = v
                break
        
        if past_val is not None:
            return latest_val - past_val
        return None

    def compute_rolling_stats(self, data: List[Tuple[datetime, float]]) -> Tuple[float, float, float]:
        if not data:
            return 0.0, 0.0, 0.0
        
        values = [v for _, v in data]
        mean_val = sum(values) / len(values)
        max_val = max(values)
        
        if len(data) < 2:
            return mean_val, max_val, 0.0
            
        # Compute slope (linear regression)
        # Convert times to hours from start
        start_time = data[0][0]
        x = [(t - start_time).total_seconds() / 3600.0 for t, _ in data]
        y = values
        
        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(xi*yi for xi, yi in zip(x, y))
        sum_xx = sum(xi*xi for xi in x)
        
        denominator = (n * sum_xx - sum_x * sum_x)
        if denominator == 0:
            slope = 0.0
        else:
            slope = (n * sum_xy - sum_x * sum_y) / denominator
            
        return mean_val, max_val, slope

    def compute_acceleration(self, data: List[Tuple[datetime, float]]) -> float:
        if len(data) < 3:
            return 0.0
            
        # compute rate of change of rate of change
        start_time = data[0][0]
        x = [(t - start_time).total_seconds() / 3600.0 for t, _ in data]
        y = [v for _, v in data]
        
        velocities = []
        for i in range(1, len(x)):
            dt = x[i] - x[i-1]
            if dt > 0:
                velocities.append((y[i] - y[i-1]) / dt)
            else:
                velocities.append(0.0)
                
        if len(velocities) < 2:
            return 0.0
            
        accelerations = []
        for i in range(1, len(velocities)):
            dt = x[i+1] - x[i]
            if dt > 0:
                accelerations.append((velocities[i] - velocities[i-1]) / dt)
            else:
                accelerations.append(0.0)
                
        if not accelerations:
            return 0.0
            
        return sum(accelerations) / len(accelerations)

    def detect_change_points(self, data: List[Tuple[datetime, float]]) -> List[datetime]:
        """CUSUM algorithm for change-point detection"""
        if len(data) < 2:
            return []
            
        values = [v for _, v in data]
        mean_val = sum(values) / len(values)
        std_val = math.sqrt(sum((v - mean_val)**2 for v in values) / len(values)) if len(values) > 1 else 1.0
        if std_val == 0:
            std_val = 1e-6
            
        cusum_pos = 0.0
        cusum_neg = 0.0
        
        change_points = []
        
        for i, (t, v) in enumerate(data):
            z = (v - mean_val) / std_val
            cusum_pos = max(0.0, cusum_pos + z - self.cusum_drift)
            cusum_neg = max(0.0, cusum_neg - z - self.cusum_drift)
            
            if cusum_pos > self.cusum_threshold or cusum_neg > self.cusum_threshold:
                change_points.append(t)
                cusum_pos = 0.0
                cusum_neg = 0.0
                
        return change_points

    def classify_trend(self, slope: float, acceleration: float, has_change_points: bool) -> TemporalTrend:
        if has_change_points and abs(slope) > 0.5:
            return TemporalTrend.RAPID_CHANGE
        elif slope > 0.1 and acceleration > 0.05:
            return TemporalTrend.ACCELERATING
        elif slope > 0.1:
            return TemporalTrend.INCREASING
        elif slope < -0.1:
            return TemporalTrend.DECREASING
        else:
            return TemporalTrend.STABLE

    def analyze(self, data: List[Tuple[datetime, float]]) -> TemporalProfile:
        """
        Analyze temporal data and return a profile
        data: sorted list of (timestamp, value) pairs
        """
        if not data:
            return TemporalProfile(
                delta_24h=None, delta_72h=None, delta_7d=None,
                mean_val=0.0, max_val=0.0, slope=0.0, acceleration=0.0,
                change_points=[], trend=TemporalTrend.STABLE
            )
            
        # Sort data by time just in case
        data = sorted(data, key=lambda x: x[0])
        
        delta_24h = self.compute_delta(data, 24)
        delta_72h = self.compute_delta(data, 72)
        delta_7d = self.compute_delta(data, 168)
        
        mean_val, max_val, slope = self.compute_rolling_stats(data)
        acceleration = self.compute_acceleration(data)
        change_points = self.detect_change_points(data)
        
        trend = self.classify_trend(slope, acceleration, len(change_points) > 0)
        
        return TemporalProfile(
            delta_24h=delta_24h,
            delta_72h=delta_72h,
            delta_7d=delta_7d,
            mean_val=mean_val,
            max_val=max_val,
            slope=slope,
            acceleration=acceleration,
            change_points=change_points,
            trend=trend
        )
