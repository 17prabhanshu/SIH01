import datetime
import numpy as np
from objects.segment import segment_storms
from objects.track import track_storms
from objects.lifecycle import detect_lifecycle_events
from core.types import GridSpec, StormObject

def create_gaussian_blob(ny, nx, cy, cx, amplitude, sigma):
    y, x = np.ogrid[:ny, :nx]
    dist_sq = (x - cx)**2 + (y - cy)**2
    return amplitude * np.exp(-dist_sq / (2 * sigma**2))

def test_segment_storms_three_blobs():
    # Create 3 well-separated blobs
    field = np.zeros((256, 256))
    field += create_gaussian_blob(256, 256, 50, 50, 45, 10)
    field += create_gaussian_blob(256, 256, 150, 150, 45, 10)
    field += create_gaussian_blob(256, 256, 50, 200, 45, 10)
    
    grid = GridSpec(center_lat=0.0, center_lon=0.0, nx=256, ny=256, dx_m=1000.0, dy_m=1000.0)
    
    storms = segment_storms(field, grid, threshold_dbz=30, timestamp=datetime.datetime.now())
    
    assert len(storms) == 3, f"Expected 3 storms, got {len(storms)}"
    
    for storm in storms:
        assert storm.area_km2 > 16.0, f"Expected area > 16, got {storm.area_km2}"
        assert 40.0 <= storm.zmax <= 45.0, f"Expected zmax ~45, got {storm.zmax}"

def test_segment_storms_empty():
    field = np.zeros((256, 256))
    grid = GridSpec(center_lat=0.0, center_lon=0.0, nx=256, ny=256, dx_m=1000.0, dy_m=1000.0)
    
    storms = segment_storms(field, grid, threshold_dbz=30, timestamp=datetime.datetime.now())
    assert len(storms) == 0

def test_segment_storms_one_large():
    field = create_gaussian_blob(256, 256, 128, 128, 50, 40)
    grid = GridSpec(center_lat=0.0, center_lon=0.0, nx=256, ny=256, dx_m=1000.0, dy_m=1000.0)
    
    storms = segment_storms(field, grid, threshold_dbz=30, timestamp=datetime.datetime.now())
    assert len(storms) == 1

def test_track_storms():
    dt = datetime.datetime.now()
    # Frame 1: one storm at (50, 50)
    storm1 = StormObject(
        storm_id="frame1_0", track_id="track_1", timestamp=dt - datetime.timedelta(minutes=10),
        centroid_lat=0.0, centroid_lon=0.0,
        area_km2=100.0, zmax=40.0, vil=10.0,
        u_kmh=0.0, v_kmh=0.0,
        lifecycle_event="none"
    )
    # mock centroid proxy by manually setting it if track_storms expects it, or maybe track_storms looks at centroid_lat/lon 
    # For now, track_storms needs centroid_lat, centroid_lon to do displacement. 
    # Let's say dx=10km means dlon = 10 / 111.32 approx 0.09.
    
    storm2 = StormObject(
        storm_id="frame2_0", track_id="track_2", timestamp=dt,
        centroid_lat=0.09, centroid_lon=0.0,
        area_km2=100.0, zmax=40.0, vil=10.0,
        u_kmh=0.0, v_kmh=0.0,
        lifecycle_event="none"
    )
    
    tracked_storms = track_storms([storm2], [storm1])
    
    assert len(tracked_storms) == 1
    ts = tracked_storms[0]
    
    assert ts.track_id is not None
    assert ts.track_id == "track_1"
    
    assert ts.v_kmh > 0.0 or ts.u_kmh > 0.0 or ts.v_kmh != 0.0 or ts.u_kmh != 0.0, "Expected non-zero motion"
    
    # Unmatched storm
    storm3 = StormObject(
        storm_id="frame2_1", track_id="track_new", timestamp=dt,
        centroid_lat=5.0, centroid_lon=5.0,
        area_km2=50.0, zmax=35.0, vil=5.0,
        u_kmh=0.0, v_kmh=0.0,
        lifecycle_event="none"
    )
    tracked_storms2 = track_storms([storm3], [storm1])
    assert tracked_storms2[0].lifecycle_event == "new"

def test_detect_lifecycle_events():
    dt = datetime.datetime.now()
    old_storm = StormObject(
        storm_id="old", track_id="track1", timestamp=dt,
        centroid_lat=0.0, centroid_lon=0.0,
        area_km2=100.0, zmax=40.0, vil=10.0,
        u_kmh=0.0, v_kmh=0.0, lifecycle_event="none"
    )
    
    # Intensification
    new_storm_intensified = StormObject(
        storm_id="new1", track_id="track1", timestamp=dt,
        centroid_lat=0.0, centroid_lon=0.0,
        area_km2=100.0, zmax=46.0, vil=10.0, # >5 dBZ increase
        u_kmh=0.0, v_kmh=0.0, lifecycle_event="none"
    )
    updated_storm_int = detect_lifecycle_events([new_storm_intensified], [old_storm])[0]
    assert updated_storm_int.lifecycle_event == "intensified"
    
    # Decay
    new_storm_decay = StormObject(
        storm_id="new2", track_id="track1", timestamp=dt,
        centroid_lat=0.0, centroid_lon=0.0,
        area_km2=40.0, zmax=40.0, vil=10.0, # >50% shrinking
        u_kmh=0.0, v_kmh=0.0, lifecycle_event="none"
    )
    updated_storm_dec = detect_lifecycle_events([new_storm_decay], [old_storm])[0]
    assert updated_storm_dec.lifecycle_event == "decaying"
