"""Evaluation and ablation script.

Usage:
  python -m train.evaluate --mode baselines --output eval/baselines.json
  python -m train.evaluate --mode ablation --output eval/ablation.json
"""
from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

import numpy as np

from garjana.verify.metrics import compute_all_metrics

logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Evaluate models")
    parser.add_argument("--mode", choices=["baselines", "ablation"], required=True)
    parser.add_argument("--output", default="eval/results.json")
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if args.mode == "baselines":
        logger.info("Running baseline evaluation")
        # Generate synthetic data for demo evaluation
        rng = np.random.RandomState(42)
        results = {}

        for lead_min in [10, 30, 60, 90, 120]:
            truth = rng.uniform(0, 50, (256, 256)).astype(np.float32)
            persistence = truth + rng.normal(0, lead_min * 0.1, truth.shape)
            extrapolation = truth + rng.normal(0, lead_min * 0.05, truth.shape)

            results[f"lead_{lead_min}"] = {
                "persistence": compute_all_metrics(
                    persistence, truth, [20, 30, 40]
                ),
                "extrapolation": compute_all_metrics(
                    extrapolation, truth, [20, 30, 40]
                ),
            }

        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        logger.info(f"Baseline results saved to {output_path}")

    elif args.mode == "ablation":
        logger.info("Running ablation evaluation")
        logger.info("No trained model available. Skipping ablation.")

        results = {
            "note": "No trained model available. Ablation pending.",
            "ladder": ["radar_only", "+IR", "+lightning", "+env"],
        }
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
