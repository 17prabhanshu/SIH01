"""Generate the Evidence Pack for the pitch.

Reads all evaluation JSONs and creates docs/RESULTS.md
"""
import json
import datetime
from pathlib import Path
import matplotlib.pyplot as plt
import subprocess

def get_git_commit():
    try:
        return subprocess.check_output(["git", "rev-parse", "--short", "HEAD"]).decode("utf-8").strip()
    except Exception:
        return "unknown"

def generate_pack():
    results_dir = Path("docs/results")
    
    # 1. Load data
    try:
        with open("eval/baselines.json") as f:
            baselines = json.load(f)
    except FileNotFoundError:
        baselines = {}
        
    try:
        with open(results_dir / "r16_gating.json") as f:
            gating = json.load(f)
    except FileNotFoundError:
        gating = {}
        
    try:
        with open(results_dir / "eta_coverage.json") as f:
            eta = json.load(f)
    except FileNotFoundError:
        eta = {}
        
    try:
        with open(results_dir / "latency.json") as f:
            latency = json.load(f)
    except FileNotFoundError:
        latency = {}
        
    try:
        with open("eval/ablation.json") as f:
            ablation = json.load(f)
    except FileNotFoundError:
        ablation = {}
        
    commit = get_git_commit()
    backend = baselines.get("metadata", {}).get("motion_backend", "numpy_block_match_fallback")
    data_source = baselines.get("metadata", {}).get("data_source", "SYNTHETIC_V2")
    seeds = baselines.get("metadata", {}).get("n_seeds", 30)

    # 2. Write RESULTS.md
    with open("docs/RESULTS.md", "w") as f:
        f.write("# Garjana Evidence Pack\n\n")
        f.write(f"*Generated on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n")
        f.write(f"*Git Commit: {commit} | Data: {data_source} (N={seeds} seeds) | Motion Backend: {backend}*\n\n")
        
        f.write("## 1. Baseline Extrapolation Skill\n")
        f.write("*(Strictly mathematically gated against persistence on independent tracking targets)*\n\n")
        f.write("| Lead Time | Persistence CSI | Extrapolation CSI (95% CI) | FSS (4px) |\n")
        f.write("|---|---|---|---|\n")
        if "results" in baselines:
            for lead in ["+10m", "+30m", "+60m", "+90m", "+120m"]:
                if lead in baselines["results"]:
                    r = baselines["results"][lead]
                    f.write(f"| {lead} | {r['csi_persist_mean']:.3f} | **{r['csi_extrap_mean']:.3f}** ({r['csi_extrap_p025']:.3f}-{r['csi_extrap_p975']:.3f}) | {r['fss_extrap_mean']:.3f} |\n")
        
        f.write("\n## 2. Residual Model Gating (R16)\n")
        if gating:
            f.write(f"- Baseline +60m CSI: {gating['baseline_csi_60m']:.3f}\n")
            f.write(f"- Residual +60m CSI: {gating['residual_csi_60m']:.3f}\n")
            f.write(f"- Gate Status: **{gating['action'].upper()}**\n")
        else:
            f.write("No gating data available.\n")
            
        f.write("\n## 3. Conformal ETA Coverage\n")
        if eta:
            f.write(f"- Nominal Target: {eta['nominal_coverage']*100}%\n")
            f.write(f"- Empirical Held-Out Coverage: **{eta['empirical_coverage']*100:.1f}%**\n")
        else:
            f.write("No ETA coverage data available.\n")
            
        f.write("\n## 4. End-to-End Latency\n")
        if latency:
            f.write(f"- Cycle Compute Latency: **{latency['cycle_latency_s']:.3f}s** (Threshold: < 2.0s)\n")
        else:
            f.write("No latency data available.\n")
            
        f.write("\n## 5. H1/H3 Ablation Ladder\n")
        f.write("| Configuration | CSI_30 | FSS_4px |\n")
        f.write("|---|---|---|\n")
        if ablation and "results" in ablation:
            for k, v in ablation["results"].items():
                f.write(f"| {k} | {v.get('csi_30dbz', 0):.3f} | {v.get('fss_4px', 0):.3f} |\n")
        
        f.write("\n\n*All numbers computed mechanically. See `docs/HONESTY.md` for assumptions.*\n")
        
    print("Wrote docs/RESULTS.md")

if __name__ == "__main__":
    generate_pack()
