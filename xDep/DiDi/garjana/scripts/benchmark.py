#!/usr/bin/env python3
import os
import sys
import numpy as np
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from replay.bundle import ReplayBundle
from forecast.motion import estimate_motion_lk
from forecast.extrapolate import _simple_advection

def compute_metrics(predicted: np.ndarray, truth: np.ndarray, threshold: float):
    p = predicted >= threshold
    t = truth >= threshold
    
    hits = np.sum(p & t)
    misses = np.sum((~p) & t)
    false_alarms = np.sum(p & (~t))
    
    pod = hits / (hits + misses) if (hits + misses) > 0 else 0.0
    far = false_alarms / (hits + false_alarms) if (hits + false_alarms) > 0 else 0.0
    csi = hits / (hits + misses + false_alarms) if (hits + misses + false_alarms) > 0 else 0.0
    
    return {"POD": float(pod), "FAR": float(far), "CSI": float(csi)}

def benchmark_bundle(bundle_name: str):
    bundle_path = Path(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "replay_bundles", bundle_name)))
    if not bundle_path.exists():
        print(f"Bundle {bundle_name} not found.")
        return
        
    print(f"Loading bundle: {bundle_name}")
    bundle = ReplayBundle(bundle_path)
    radar_frames = bundle.get_frames("radar")
    
    num_frames = len(radar_frames)
    if num_frames < 3:
        print("Not enough frames.")
        return
        
    print(f"Found {num_frames} frames. Running cross-correlation benchmark...")
    
    metrics_30 = {"POD": [], "FAR": [], "CSI": []}
    metrics_45 = {"POD": [], "FAR": [], "CSI": []}
    
    for i in range(1, min(10, num_frames - 1)):
        t_minus_1 = radar_frames[i - 1]
        t_0 = radar_frames[i]
        t_plus_1 = radar_frames[i + 1]
        
        motion = estimate_motion_lk([t_minus_1, t_0])
        pred_t_plus_1 = _simple_advection(t_0, motion, n_steps=1)[0]
        
        valid = ~np.isnan(t_plus_1)
        pred = np.nan_to_num(pred_t_plus_1)[valid]
        truth = np.nan_to_num(t_plus_1)[valid]
        
        m30 = compute_metrics(pred, truth, 30.0)
        m45 = compute_metrics(pred, truth, 45.0)
        
        metrics_30["POD"].append(m30["POD"])
        metrics_30["FAR"].append(m30["FAR"])
        metrics_30["CSI"].append(m30["CSI"])
        metrics_45["POD"].append(m45["POD"])
        metrics_45["FAR"].append(m45["FAR"])
        metrics_45["CSI"].append(m45["CSI"])
            
    print("\n--- BENCHMARK RESULTS ---")
    print("Moderate Rain (30 dBZ) tracking:")
    print(f"  CSI: {np.mean(metrics_30['CSI']):.3f}")
    print(f"  POD: {np.mean(metrics_30['POD']):.3f}")
    print(f"  FAR: {np.mean(metrics_30['FAR']):.3f}")
    
    print("\nHeavy Rain (45 dBZ) tracking:")
    print(f"  CSI: {np.mean(metrics_45['CSI']):.3f}")
    print(f"  POD: {np.mean(metrics_45['POD']):.3f}")
    print(f"  FAR: {np.mean(metrics_45['FAR']):.3f}")
    print("-------------------------")
    
    with open(os.path.join(os.path.dirname(__file__), "..", "..", "benchmark_report.md"), "w") as f:
        f.write("# Garjana Model Benchmark\n")
        f.write("## Mumbai Cloudburst Dataset\n")
        f.write(f"- Moderate Rain CSI: {np.mean(metrics_30['CSI']):.3f}\n")
        f.write(f"- Heavy Rain CSI: {np.mean(metrics_45['CSI']):.3f}\n")

if __name__ == "__main__":
    benchmark_bundle("ICB_MUM_2023_07_20")
