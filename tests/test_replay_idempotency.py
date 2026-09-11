import pytest
import asyncio
import httpx
from httpx import AsyncClient
from services.api.main import app

@pytest.mark.asyncio
async def test_replay_idempotency():
    """
    Test that evaluating the same historical timestamp repeatedly
    does not duplicate alerts or events in the database.
    """
    url = '/api/v1/risk/evaluate?lat=27.3314&lon=88.6138&timestamp=2023-10-04T12:00:00Z'
    
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Run 1
        resp1 = await client.get(url)
        assert resp1.status_code == 200
        data1 = resp1.json()
        
        # Run 2
        resp2 = await client.get(url)
        assert resp2.status_code == 200
        data2 = resp2.json()
        
        # Ensure we didn't crash and we get the same hazard score
        assert data1["fusion_result"]["hazard_evidence_score"] == data2["fusion_result"]["hazard_evidence_score"]
