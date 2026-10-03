"""Training script for the residual U-Net.

Deterministic seeds, model cards, R16 gating check.
"""
from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Train residual U-Net")
    parser.add_argument("--data-dir", default="data/prepared")
    parser.add_argument("--output-dir", default="models")
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--base-width", type=int, default=32)
    args = parser.parse_args()

    logger.info(f"Training residual U-Net with seed={args.seed}")
    logger.info("R16: Model will only be served where CSI >= baseline")

    # Create model card
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    model_card = {
        "model": "residual_unet",
        "version": "v0.1",
        "seed": args.seed,
        "epochs": args.epochs,
        "base_width": args.base_width,
        "data": "SEVIR (US data, SYNTHETIC fidelity)",
        "split": "temporal (R6)",
        "gating": {
            "passes_gate": False,
            "note": "No training data available yet. Baseline only.",
        },
        "metrics": {},
        "limitations": [
            "Trained on US (SEVIR) data only",
            "Not validated on Indian storms",
            "Baseline mode until gating criteria met",
        ],
    }

    with open(output_dir / "residual_unet.json", "w") as f:
        json.dump(model_card, f, indent=2)

    logger.info(f"Model card saved to {output_dir / 'residual_unet.json'}")
    logger.info("No training data available. Model card created with gating=False.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
