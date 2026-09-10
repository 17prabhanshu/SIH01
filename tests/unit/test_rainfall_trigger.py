import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone

def compute_cumulative_rainfall(df: pd.DataFrame, window: str) -> pd.Series:
    return df['rainfall'].rolling(window=window).sum()

def detect_anomaly(rainfall: float, threshold: float) -> bool:
    return rainfall > threshold

def test_cumulative_rainfall():
    dates = [datetime.now(timezone.utc) - timedelta(hours=i) for i in range(10)][::-1]
    df = pd.DataFrame({'rainfall': [10]*10}, index=dates)
    cumulative_3h = compute_cumulative_rainfall(df, '3h')
    assert cumulative_3h.iloc[-1] == 30.0

def test_anomaly_detection():
    assert detect_anomaly(150.0, 100.0) == True
    assert detect_anomaly(50.0, 100.0) == False

def test_missing_data_handling():
    dates = pd.date_range(end=datetime.now(timezone.utc), periods=5, freq='h')
    df = pd.DataFrame({'rainfall': [10, np.nan, 20, np.nan, 30]}, index=dates)
    interpolated = df['rainfall'].interpolate()
    assert not interpolated.isna().any()
    assert interpolated.iloc[1] == 15.0

def test_threshold_exceedance():
    rainfall = 250.0
    threshold = 200.0
    exceedance = max(0, rainfall - threshold)
    assert exceedance == 50.0
