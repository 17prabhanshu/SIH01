import datetime
import numpy as np
from align.regrid import regrid_bilinear, regrid_to_grid
from align.timesync import sync_observation_to_cycle, find_closest_observation
from align.observability import compute_radar_coverage, compute_radar_freshness, compute_observability_index
from qc.radar import qc_radar
from qc.beam_blockage import compute_beam_blockage
from core.types import Observation, Fidelity, GridSpec

def test_regrid():
    # 384x384 input -> 256x256 output
    input_field = np.ones((384, 384))
    output_field = regrid_bilinear(input_field, target_shape=(256, 256))
    assert output_field.shape == (256, 256)
    
    # Same size -> no change in shape
    same_size = regrid_bilinear(input_field, target_shape=(384, 384))
    assert same_size.shape == (384, 384)

def test_timesync():
    cycle_time = datetime.datetime(2026, 9, 30, 12, 0)
    
    obs_ontime = Observation(
        source="test",
        valid_time=cycle_time,
        received_time=cycle_time,
        fidelity=Fidelity.NATIVE
    )
    
    # Observation at cycle_time -> accepted
    synced_ontime = sync_observation_to_cycle(obs_ontime, cycle_time, max_age_minutes=15)
    assert synced_ontime is not None
    assert synced_ontime.age_minutes == 0
    
    # Observation 20 min old -> rejected
    obs_old = Observation(
        source="test",
        valid_time=cycle_time - datetime.timedelta(minutes=20),
        received_time=cycle_time, # Received now, but valid 20 min ago
        fidelity=Fidelity.NATIVE
    )
    synced_old = sync_observation_to_cycle(obs_old, cycle_time, max_age_minutes=15)
    assert synced_old is None
    
    # find_closest_observation
    obs_10min = Observation(
        source="test",
        valid_time=cycle_time - datetime.timedelta(minutes=10),
        received_time=cycle_time,
        fidelity=Fidelity.NATIVE
    )
    closest = find_closest_observation([obs_old, obs_10min], cycle_time, max_age_minutes=15)
    assert closest == obs_10min

def test_observability():
    grid = GridSpec(center_lat=0.0, center_lon=0.0, nx=256, ny=256, dx_m=1000.0, dy_m=1000.0)
    
    cov = compute_radar_coverage(grid)
    # Center cell is approx 1.0
    assert cov[128, 128] > 0.9
    # Edge cell is less
    assert cov[0, 0] < cov[128, 128]
    
    # Freshness
    fresh_0 = compute_radar_freshness(0.0)
    assert fresh_0 > 0.9
    
    fresh_30 = compute_radar_freshness(30.0)
    assert fresh_30 < 0.1
    
    oi_comp, components = compute_observability_index(grid, radar_age_minutes=5.0)
    assert np.all(oi_comp >= 0.0) and np.all(oi_comp <= 1.0)
    assert "radar_coverage" in components
    assert "radar_freshness" in components

def test_qc_radar():
    grid = np.ones((10, 10)) * 80.0
    grid[0, 0] = np.nan
    
    obs = Observation(
        source="test",
        valid_time=datetime.datetime.now(),
        received_time=datetime.datetime.now(),
        fidelity=Fidelity.NATIVE,
        grid=grid
    )
    
    qcd_obs = qc_radar(obs, max_dbz=75.0)
    assert np.max(qcd_obs.grid) <= 75.0
    assert qcd_obs.qc.get("status") == "passed"
    assert "missing_frac" in qcd_obs.qc
    assert qcd_obs.qc["missing_frac"] > 0.0

def test_beam_blockage():
    grid = GridSpec(center_lat=0.0, center_lon=0.0, nx=256, ny=256, dx_m=1000.0, dy_m=1000.0)
    
    # No DEM -> all zeros
    block_no_dem = compute_beam_blockage(None, grid)
    assert np.all(block_no_dem == 0.0)
    
    # Synthetic ridge -> blockage > 0
    dem = np.zeros((256, 256))
    dem[:, 150:] = 1000.0 # 1km high ridge
    block = compute_beam_blockage(dem, grid)
    assert np.sum(block) > 0.0
