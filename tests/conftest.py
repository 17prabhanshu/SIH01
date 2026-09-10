import pytest
from datetime import datetime, timezone, timedelta

@pytest.fixture
def test_db():
    # Mocking real db interactions in tests
    return "db_connection_mock"

@pytest.fixture
def test_redis():
    return "redis_connection_mock"

@pytest.fixture
def test_client():
    from fastapi.testclient import TestClient
    from fastapi import FastAPI
    app = FastAPI()
    return TestClient(app)

@pytest.fixture
def create_test_landslide():
    def _create_landslide():
        return {
            "id": 1,
            "latitude": 27.3389,
            "longitude": 88.6065, # Sikkim coordinates
            "severity": "HIGH",
            "status": "ACTIVE"
        }
    return _create_landslide

@pytest.fixture
def create_test_alert():
    def _create_alert():
        return {
            "id": 101,
            "region": "Sikkim",
            "evidence": {"rainfall": 150.5, "soil_moisture": 85.0},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    return _create_alert

@pytest.fixture
def create_test_sensor():
    def _create_sensor():
        return {
            "id": 201,
            "type": "RAIN_GAUGE",
            "status": "OPERATIONAL",
            "metadata": {"elevation": 1500, "installation_date": "2020-01-01"}
        }
    return _create_sensor

@pytest.fixture
def create_test_rainfall():
    def _create_rainfall():
        return {
            "sensor_id": 201,
            "cumulative_24h": 120.5,
            "cumulative_72h": 250.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    return _create_rainfall

@pytest.fixture
def create_test_model_run():
    def _create_model_run():
        return {
            "model_version": "v1.2.0",
            "run_id": "run_999",
            "status": "SUCCESS",
            "metrics": {"accuracy": 0.92, "f1_score": 0.88}
        }
    return _create_model_run

@pytest.fixture(autouse=True)
def gee_mock(monkeypatch):
    monkeypatch.setenv("GEE_SERVICE_ACCOUNT", "dummy@developer.gserviceaccount.com")
    monkeypatch.setenv("GEE_PRIVATE_KEY", "dummy_key")

@pytest.fixture(autouse=True)
def env_mock(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://test:test@localhost:5432/testdb")
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379/0")
