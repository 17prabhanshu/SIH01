"""Configuration loader for Garjana.

All thresholds and constants live in config/*.yaml with source comments.
No magic numbers in code (R14).
"""
from __future__ import annotations
import os
from pathlib import Path
from typing import Any
import yaml

_CONFIG_DIR = Path(__file__).parent.parent.parent / "config"


def _resolve_config_dir() -> Path:
    """Resolve config directory, respecting GARJANA_CONFIG_DIR env var."""
    env_dir = os.environ.get("GARJANA_CONFIG_DIR")
    if env_dir:
        return Path(env_dir)
    return _CONFIG_DIR


def load_config(name: str) -> dict[str, Any]:
    """Load a YAML config file by name (without extension).
    
    Args:
        name: Config file name without .yaml extension
        
    Returns:
        Parsed YAML as dict
        
    Raises:
        FileNotFoundError: If config file doesn't exist
    """
    path = _resolve_config_dir() / f"{name}.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")
    with open(path) as f:
        return yaml.safe_load(f) or {}


def load_all_configs() -> dict[str, dict[str, Any]]:
    """Load all YAML config files from the config directory."""
    config_dir = _resolve_config_dir()
    configs = {}
    for path in sorted(config_dir.glob("*.yaml")):
        configs[path.stem] = load_config(path.stem)
    return configs


class Config:
    """Cached config accessor."""
    _cache: dict[str, dict[str, Any]] = {}

    @classmethod
    def get(cls, name: str) -> dict[str, Any]:
        if name not in cls._cache:
            cls._cache[name] = load_config(name)
        return cls._cache[name]

    @classmethod
    def reload(cls) -> None:
        cls._cache.clear()
