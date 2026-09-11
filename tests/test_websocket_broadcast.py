import pytest
import asyncio
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone
import services.api.routes.websocket
from services.alerts.engine import AlertEngine
from services.fusion.pipeline import FusionResult

@pytest.mark.asyncio
async def test_alert_engine_websocket_broadcast_ordering():
    """
    Test that AlertEngine commits to DB *before* triggering the WebSocket broadcast.
    This guarantees no "ghost alerts" are sent to clients.
    """
    mock_db = MagicMock()
    mock_db.execute = MagicMock(return_value=asyncio.Future())
    mock_db.execute.return_value.set_result(None)
    mock_db.commit = MagicMock(return_value=asyncio.Future())
    mock_db.commit.return_value.set_result(None)

    # Setup dummy fusion and exposure
    fusion_result = FusionResult(
        request_id="req-123",
        location={"lat": 27.33, "lon": 88.61},
        hazard_evidence_score=0.9,  # High score to guarantee P1/P2 alert
        calibrated_probability=0.9,
        evidence_coverage=1.0,
        assessment_status="COMPLETE",
        assessment_confidence="HIGH",
        data_freshness={"rainfall": "LIVE"},
        contributing_factors="Rain",
        explainability_report="Heavy Rain",
        model_agreement={},
        missing_data=[],
        timestamp=datetime.now(timezone.utc)
    )
    exposure_result = {"exposure_criticality": 0.8}
    
    with patch("services.api.routes.websocket.manager.broadcast") as mock_broadcast:
        # Mock broadcast as an async function
        async def mock_async_broadcast(payload):
            pass
        mock_broadcast.side_effect = mock_async_broadcast
        
        engine = AlertEngine(db_session=mock_db)
        alert = await engine.evaluate(fusion_result, exposure_result)
        
        assert alert is not None
        
        # Verify DB commit was called
        mock_db.commit.assert_called_once()
        
        # Wait a tiny bit to allow asyncio.create_task for broadcast to run
        await asyncio.sleep(0.01)
        
        # Verify broadcast was called AFTER commit
        mock_broadcast.assert_called_once()
        
        # We can also verify the payload structure
        args, kwargs = mock_broadcast.call_args
        payload = args[0]
        assert payload["type"] == "NEW_ALERT"
        assert payload["data"]["alert_id"] == alert.alert_id

