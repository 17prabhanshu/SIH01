from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "service" in response.json()

def test_system_modes():
    response = client.get("/modes")
    assert response.status_code == 200
    data = response.json()
    assert "system_mode" in data

def test_replay_latest_empty():
    # Depends on global state but initially it might be empty
    response = client.get("/replay/latest")
    assert response.status_code == 200

def test_get_storms():
    response = client.get("/storms")
    assert response.status_code == 200
    data = response.json()
    assert "storms" in data
    assert "count" in data

def test_get_hazards():
    response = client.get("/hazards")
    assert response.status_code == 200
    data = response.json()
    assert "hazards" in data

def test_get_eta():
    response = client.get("/eta")
    assert response.status_code == 200
    data = response.json()
    assert "estimates" in data

def test_get_alerts():
    response = client.get("/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data

def test_get_oi():
    response = client.get("/oi")
    assert response.status_code == 200

def test_data_health():
    response = client.get("/data-health")
    assert response.status_code == 200
    data = response.json()
    assert "sources" in data

def test_verification():
    response = client.get("/verification")
    assert response.status_code == 200

def test_forecast_frames():
    response = client.get("/forecast/frames")
    assert response.status_code == 200

def test_replay_bundles():
    response = client.get("/replay/bundles")
    assert response.status_code == 200
