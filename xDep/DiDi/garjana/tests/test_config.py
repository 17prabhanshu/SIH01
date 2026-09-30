"""Tests for configuration loading."""
import pytest

from core.config import Config, load_config


def test_load_domains():
    """Test loading domains config."""
    cfg = load_config("domains")
    assert "domains" in cfg
    assert "SEVIR_DEV" in cfg["domains"]


def test_load_grid():
    cfg = load_config("grid")
    assert cfg["grid"]["nx"] == 256
    assert cfg["grid"]["dx_m"] == 2000.0


def test_load_thresholds():
    cfg = load_config("thresholds")
    assert "hazard_thresholds" in cfg
    assert "segmentation" in cfg


def test_load_zr():
    cfg = load_config("zr")
    assert "zr_relationships" in cfg
    assert cfg["default"] == "tropical_convective"


def test_nonexistent_config():
    with pytest.raises(FileNotFoundError):
        load_config("nonexistent_config_file")


def test_config_cache():
    Config.reload()
    cfg1 = Config.get("grid")
    cfg2 = Config.get("grid")
    assert cfg1 is cfg2  # Same object from cache
