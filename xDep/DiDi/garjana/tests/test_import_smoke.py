"""Import smoke test: every module must be importable.

If any module has a broken import, missing file, or syntax error
this test will fail immediately — catching misplaced files early.
"""
import importlib

import pytest

# Every module that must import cleanly.
# Grouped by layer to make failures easy to locate.
MODULES = [
    # Core (P0)
    "core.types",
    "core.time",
    "core.grid",
    "core.provenance",
    "core.config",
    # DB (P0)
    "db.repo",
    # Providers (P1)
    "providers.base",
    "providers.synthetic",
    "providers.sevir",
    # Align (P1)
    "align.features",
    "align.regrid",
    "align.timesync",
    "align.observability",
    # Forecast (P1-P2)
    "forecast.motion",
    "forecast.extrapolate",
    "forecast.ensemble",
    "forecast.blender",
    "forecast.initiation",
    "forecast.outlook",
    "forecast.residual_unet",
    "forecast.export_onnx",
    # QC (P1)
    "qc.radar",
    "qc.satellite",
    "qc.lightning",
    "qc.beam_blockage",
    # Objects (P3)
    "objects.segment",
    "objects.track",
    "objects.lifecycle",
    # Hazards (P4)
    "hazards.tiers",
    "hazards.lightning",
    "hazards.rain",
    "hazards.extreme_rain",
    "hazards.hail",
    "hazards.wind",
    # Decision (P5)
    "decision.exposure",
    "decision.eta",
    "decision.severity",
    "decision.cap",
    "decision.delivery",
    "decision.i18n",
    # Verify (P1)
    "verify.metrics",
    "verify.baselines",
    "verify.leakage_tests",
    "verify.benchmark",
    # Replay (P1)
    "replay.clock",
    "replay.bundle",
    # Workers (P6)
    "workers.cycle",
    "workers.ingest",
    "workers.alert_worker",
    # API (P6)
    "api.main",
    "api.schemas",
    "api.ws",
]


@pytest.mark.parametrize("module", MODULES)
def test_import(module: str) -> None:
    """Every listed module must import without error."""
    importlib.import_module(module)
