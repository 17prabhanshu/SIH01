import datetime
import tempfile
import numpy as np
import pytest
from replay.clock import ReplayClock
from replay.bundle import ReplayBundle

def test_replay_clock():
    start = datetime.datetime(2026, 9, 30, 10, 0)
    end = datetime.datetime(2026, 9, 30, 11, 0)
    
    clock = ReplayClock(start_time=start, end_time=end, event_id="test_event")
    
    # Starts at aligned time
    assert clock.current_time.minute % 10 == 0
    
    # advance() moves forward by 10 min
    t1 = clock.current_time
    t2 = clock.advance()
    assert (t2 - t1).total_seconds() == 600
    
    # banner() contains 'REPLAY' (R9)
    assert 'REPLAY' in clock.banner()
    assert 'test_event' in clock.banner()
    
    # pause/resume works
    clock.pause()
    assert clock.is_paused
    
    clock.resume()
    assert not clock.is_paused
    
    # is_finished when current >= end
    clock.seek(datetime.datetime(2026, 9, 30, 11, 5))
    assert clock.is_finished

def test_replay_bundle():
    with tempfile.TemporaryDirectory() as tmpdir:
        bundle = ReplayBundle(tmpdir)
        
        start = datetime.datetime(2026, 9, 30, 10, 0)
        end = datetime.datetime(2026, 9, 30, 11, 0)
        
        # save/load roundtrip for metadata
        bundle.set_metadata(
            event_id="test",
            start_time=start,
            end_time=end,
            domain="test_domain",
            sources=["radar"],
            fidelity="native"
        )
        
        # add_frames / get_frames roundtrip
        frames = [np.ones((5, 5)) for _ in range(3)]
        bundle.add_frames("radar", frames)
        
        # Save bundle
        bundle.save()
        
        # Reload
        bundle2 = ReplayBundle(tmpdir)
        bundle2.load()
        
        meta = bundle2.metadata
        assert meta["event_id"] == "test"
        
        loaded_frames = bundle2.get_frames("radar")
        assert len(loaded_frames) == 3
        for f in loaded_frames:
            assert np.array_equal(f, np.ones((5, 5)))
