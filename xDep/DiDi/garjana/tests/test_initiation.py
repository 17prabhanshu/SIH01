"""Test Rule-based Convective Initiation (Stage A)."""
import numpy as np

from forecast.initiation import detect_ci_rules

def test_detect_ci_rules_cooling_rate():
    # Setup TIR grids (256x256)
    ir_prev = np.full((10, 10), 280.0)  # warm
    ir_now = np.full((10, 10), 280.0)
    
    # Introduce a rapidly cooling core (10 pixels)
    # Cooling threshold is -4.0 K / 15 min
    ir_now[3:5, 3:8] = 270.0  # Cooled by 10 K (passes threshold)
    
    # Needs to also pass the IR window test (<235 K). Let's make it cold enough.
    ir_prev[3:5, 3:8] = 240.0
    ir_now[3:5, 3:8] = 230.0 # Passes IR window <235
    
    wv_now = np.full((10, 10), 250.0)
    wv_now[3:5, 3:8] = 200.0 # wv_now - ir_now = 200 - 230 = -30 (passes wv_ir_diff < -25)
    
    res = detect_ci_rules(ir_tb=ir_now, ir_tb_prev=ir_prev, wv_tb=wv_now, dt_minutes=15.0)
    
    assert res["ci_detected"] is True, f"Failed: {res['tests_failed']}"
    assert res["ci_pixels"] == 10
    
def test_detect_ci_rules_no_cooling():
    ir_prev = np.full((10, 10), 280.0)
    ir_now = np.full((10, 10), 280.0)
    
    res = detect_ci_rules(ir_tb=ir_now, ir_tb_prev=ir_prev, wv_tb=ir_now, dt_minutes=15.0)
    
    assert res["ci_detected"] is False
    assert "cooling_rate" in res["tests_failed"]
