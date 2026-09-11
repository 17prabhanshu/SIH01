import pytest
import asyncio
from datetime import datetime
import json
import uuid
import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

@pytest.mark.asyncio
async def test_end_to_end_evaluation_persistence():
    # 1. Setup DB Session
    DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5435/landslide_db"
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # Check if DB is reachable
    try:
        async with async_session() as session:
            pass
    except Exception:
        pytest.skip("Database not reachable. Skipping integration test.")
        
    from services.fusion.pipeline import FusionPipeline
    from services.fusion.exposure import ExposureEngine
    from services.alerts.engine import AlertEngine
    
    lat, lon = 27.3314, 88.6138
    
    # 2. Run Pipeline
    async with async_session() as session:
        pipeline = FusionPipeline(session)
        
        # Test Causal Leakage by mocking time context
        time_context = datetime(2023, 10, 4, 12, 0) # Sikkim event
        fusion_result = await pipeline.run(lat, lon, time_context=time_context)
        
        assert fusion_result.assessment_status in ["LIMITED EVIDENCE", "SUFFICIENT EVIDENCE"]
        
        # 3. Run Exposure
        exposure_engine = ExposureEngine()
        exposure_result = await exposure_engine.get_exposure_metrics(lat, lon)
        assert isinstance(exposure_result, dict)
        
        # 4. Run AlertEngine
        alert_engine = AlertEngine(db_session=session)
        alert = await alert_engine.evaluate(fusion_result, exposure_result)
        
    # 5. Verify Persistence via direct connection to ensure commit succeeded
    conn = await asyncpg.connect("postgresql://postgres:postgres@localhost:5435/landslide_db")
    
    # 5.1 Check Model Run
    model_runs = await conn.fetch("SELECT * FROM model_runs ORDER BY created_at DESC LIMIT 1")
    assert len(model_runs) == 1
    run = dict(model_runs[0])
    assert run['status'] in ['SUCCESS', 'FAILED']
    
    # 5.2 Check Model Prediction
    preds = await conn.fetch("SELECT * FROM model_predictions ORDER BY created_at DESC LIMIT 1")
    assert len(preds) == 1
    pred = dict(preds[0])
    assert pred['hazard_evidence_score'] == fusion_result.hazard_evidence_score
    
    # 5.3 Check Alert
    if alert:
        alerts = await conn.fetch(
            "SELECT * FROM alerts WHERE title = $1",
            f"Landslide Alert {alert.alert_id}",
        )
        assert len(alerts) == 1
        db_alert = dict(alerts[0])
        assert db_alert['source_type'] == "REPLAY"
        
    await conn.close()
    await engine.dispose()
