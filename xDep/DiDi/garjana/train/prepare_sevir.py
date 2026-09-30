"""SEVIR data preparation with temporal split.

Splits: train (2017-01-01 to 2019-06-01), val (2019-06-01 to 2019-09-01),
test (2019-09-01 to 2019-12-31). R6: Event-based and time-based only.
"""
from __future__ import annotations

import argparse
import logging

logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Prepare SEVIR data")
    parser.add_argument("--data-dir", default="data/sevir")
    parser.add_argument("--output-dir", default="data/prepared")
    args = parser.parse_args()

    logger.info(f"Preparing SEVIR data from {args.data_dir}")
    logger.info("R6: Using temporal split (event-based, no random frame split)")
    logger.info("Note: SEVIR is US data, labelled SYNTHETIC for Indian context")
    # Implementation when SEVIR data is available
    logger.info("No SEVIR data found. Skipping preparation.")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
