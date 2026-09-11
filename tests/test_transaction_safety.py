import pytest
import asyncio
from unittest.mock import patch, MagicMock
from datetime import datetime

@pytest.mark.asyncio
async def test_websocket_aborts_on_db_failure():
    from services.alerts.engine import AlertEngine
    from services.fusion.pipeline import FusionResult
    
    # Mock DB session that raises an error on commit
    mock_db = MagicMock()
    mock_db.execute = getattr(mock_db, 'execute', MagicMock())
    mock_db.commit = getattr(mock_db, 'commit', MagicMock())
    
    async def mock_commit():
        raise Exception("Database integrity error!")
        
    mock_db.commit.side_effect = mock_commit
    
    engine = AlertEngine(db_session=mock_db)
    
    fusion_result = FusionResult(
        location={"lat": 27.0, "lon": 88.0},
        timestamp=datetime.now(),
        hazard_evidence_score=0.9,
        assessment_status="SUFFICIENT EVIDENCE",
        data_freshness={"rainfall": "LIVE"},
        evidence_coverage=1.0,
        model_agreement=1.0,
        explainability_report="Test",
        contributing_factors=["Test"]
    )
    exposure_result = {}
    
    with patch('services.api.routes.websocket.ws_manager.broadcast') as mock_broadcast:
        try:
            await engine.evaluate(fusion_result, exposure_result)
            assert False, "Should have raised exception"
        except Exception:
            pass
            
        mock_broadcast.assert_not_called()

@pytest.mark.asyncio
async def test_db_persists_on_websocket_failure():
    from services.alerts.engine import AlertEngine
    from services.fusion.pipeline import FusionResult
    
    mock_db = MagicMock()
    mock_db.commit = getattr(mock_db, 'commit', MagicMock())
    async def mock_commit(): pass
    mock_db.commit.side_effect = mock_commit
    
    engine = AlertEngine(db_session=mock_db)
    
    fusion_result = FusionResult(
        location={"lat": 27.0, "lon": 88.0},
        timestamp=datetime.now(),
        hazard_evidence_score=0.9,
        assessment_status="SUFFICIENT EVIDENCE",
        data_freshness={"rainfall": "LIVE"},
        evidence_coverage=1.0,
        model_agreement=1.0,
        explainability_report="Test",
        contributing_factors=["Test"]
    )
    exposure_result = {}
    
    with patch('services.api.routes.websocket.ws_manager.broadcast') as mock_broadcast:
        mock_broadcast.side_effect = Exception("WebSocket disconnected!")
        
        alert = await engine.evaluate(fusion_result, exposure_result)
        
        # DB commit was called before the websocket crash
        assert mock_db.commit.called
        assert alert is not None
