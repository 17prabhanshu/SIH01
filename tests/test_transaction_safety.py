import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime

@pytest.mark.asyncio
async def test_websocket_aborts_on_db_failure():
    from services.alerts.engine import AlertEngine
    from services.fusion.pipeline import FusionResult

    # Mock DB session with async methods
    mock_db = MagicMock()
    mock_db.execute = AsyncMock()
    mock_db.commit = AsyncMock(side_effect=Exception("Database integrity error!"))
    mock_db.rollback = AsyncMock()

    engine = AlertEngine(db_session=mock_db)

    fusion_result = FusionResult(
        request_id="test-001",
        location={"lat": 27.0, "lon": 88.0},
        timestamp=datetime.now(),
        hazard_evidence_score=0.9,
        calibrated_probability=None,
        assessment_status="SUFFICIENT EVIDENCE",
        assessment_confidence="HIGH",
        data_freshness={"rainfall": "LIVE"},
        evidence_coverage=1.0,
        model_agreement=1.0,
        explainability_report="Test",
        contributing_factors={"rainfall_trigger": 0.9},
        missing_data=[]
    )
    exposure_result = {}

    with patch('services.api.routes.websocket.manager') as mock_ws_manager:
        mock_ws_manager.broadcast = AsyncMock()

        # The engine should catch the DB error and return None (no alert)
        result = await engine.evaluate(fusion_result, exposure_result)

        # The broadcast should NOT have been called because the DB commit failed
        # and the error was caught before the broadcast could fire
        assert result is None

@pytest.mark.asyncio
async def test_db_persists_on_websocket_failure():
    from services.alerts.engine import AlertEngine
    from services.fusion.pipeline import FusionResult

    mock_db = MagicMock()
    mock_db.execute = AsyncMock()
    mock_db.commit = AsyncMock()  # commit succeeds
    mock_db.rollback = AsyncMock()

    engine = AlertEngine(db_session=mock_db)

    fusion_result = FusionResult(
        request_id="test-002",
        location={"lat": 27.0, "lon": 88.0},
        timestamp=datetime.now(),
        hazard_evidence_score=0.9,
        calibrated_probability=None,
        assessment_status="SUFFICIENT EVIDENCE",
        assessment_confidence="HIGH",
        data_freshness={"rainfall": "LIVE"},
        evidence_coverage=1.0,
        model_agreement=1.0,
        explainability_report="Test",
        contributing_factors={"rainfall_trigger": 0.9},
        missing_data=[]
    )
    exposure_result = {}

    with patch('services.api.routes.websocket.manager') as mock_ws_manager:
        mock_ws_manager.broadcast = AsyncMock(side_effect=Exception("WebSocket disconnected!"))

        alert = await engine.evaluate(fusion_result, exposure_result)

        # DB commit was called successfully before the websocket broadcast attempt
        assert mock_db.commit.called
        assert alert is not None
