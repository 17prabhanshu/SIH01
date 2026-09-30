import yaml
import pytest
from pathlib import Path
from core.types import SystemMode

def determine_system_mode(radar_age: float, satellite_age: float, lightning_age: float, nwp_age: float) -> SystemMode:
    config_path = Path("config/modes.yaml")
    if not config_path.exists():
        pytest.skip("config/modes.yaml not found")
        
    with open(config_path) as f:
        data = yaml.safe_load(f)
        
    modes = data["modes"]
    order = data["transition_order"]
    
    for mode_str in order:
        reqs = modes[mode_str].get("requires", {})
        
        # Check requirements
        radar_req = reqs.get("radar_age_max_minutes")
        sat_req = reqs.get("satellite_age_max_minutes")
        ltg_req = reqs.get("lightning_age_max_minutes")
        nwp_req = reqs.get("nwp_age_max_hours")
        
        match = True
        if radar_req is not None and radar_age > radar_req:
            match = False
        if sat_req is not None and satellite_age > sat_req:
            match = False
        if ltg_req is not None and lightning_age > ltg_req:
            match = False
        if nwp_req is not None and (nwp_age * 60) > (nwp_req * 60):  # nwp is in hours
            match = False
            
        if match:
            return SystemMode(mode_str)
            
    return SystemMode.BASELINE

def test_system_modes():
    # All sources fresh -> FULL
    mode = determine_system_mode(radar_age=5, satellite_age=15, lightning_age=10, nwp_age=2)
    assert mode == SystemMode.FULL
    
    # Lightning missing -> NO_LIGHTNING
    mode = determine_system_mode(radar_age=5, satellite_age=15, lightning_age=60, nwp_age=2)
    assert mode == SystemMode.NO_LIGHTNING
    
    # Radar + satellite only -> RADAR_SAT
    mode = determine_system_mode(radar_age=5, satellite_age=15, lightning_age=60, nwp_age=12)
    assert mode == SystemMode.RADAR_SAT
    
    # Only radar -> RADAR_ONLY
    mode = determine_system_mode(radar_age=5, satellite_age=45, lightning_age=60, nwp_age=12)
    assert mode == SystemMode.RADAR_ONLY
    
    # Only satellite -> SAT_ONLY
    mode = determine_system_mode(radar_age=25, satellite_age=15, lightning_age=60, nwp_age=12)
    assert mode == SystemMode.SAT_ONLY
    
    # Nothing fresh -> BASELINE
    mode = determine_system_mode(radar_age=25, satellite_age=45, lightning_age=60, nwp_age=12)
    assert mode == SystemMode.BASELINE
