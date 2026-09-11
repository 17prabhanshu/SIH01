import asyncio
from datetime import datetime, timezone
from services.fusion.replay import EventReplayEngine

async def run():
    engine = EventReplayEngine()
    timesteps = [
        datetime(2023, 10, 1, 12, 0, tzinfo=timezone.utc),
        datetime(2023, 10, 2, 12, 0, tzinfo=timezone.utc),
        datetime(2023, 10, 3, 12, 0, tzinfo=timezone.utc),
        datetime(2023, 10, 4, 12, 0, tzinfo=timezone.utc),
        datetime(2023, 10, 7, 13, 0, tzinfo=timezone.utc),
        datetime(2023, 10, 8, 12, 0, tzinfo=timezone.utc)
    ]
    
    print("Executing Historical Replay for Oct 2023 Sikkim GLOF...")
    steps = await engine.execute_replay(27.3314, 88.6138, timesteps)
    
    for s in steps:
        print(f"\n--- {s.timestamp.isoformat()} ---")
        print(f"Hazard Score: {s.fusion_result.hazard_evidence_score:.3f}")
        print(f"Rainfall 24h: {s.fusion_result.contributing_factors.get('rainfall_trigger', 0):.3f}")
        print(f"SAR Anomaly: {s.fusion_result.contributing_factors.get('sar_amplitude_change')}")
        if s.alert:
            print(f"ALERT: {s.alert.priority} - {s.alert.reason}")
        else:
            print("ALERT: None")

if __name__ == "__main__":
    asyncio.run(run())
