import pytest
from pydantic import BaseModel, Field, ValidationError
from typing import Optional
from enum import Enum

class Severity(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    SEVERE = "SEVERE"

class AlertRequest(BaseModel):
    lat: float = Field(..., ge=21.5, le=29.5)
    lon: float = Field(..., ge=89.5, le=97.5)
    severity: Severity
    description: str

def test_coordinate_bounds():
    # Valid
    alert = AlertRequest(lat=25.0, lon=92.0, severity=Severity.HIGH, description="Test")
    assert alert.lat == 25.0

    # Invalid lat
    with pytest.raises(ValidationError):
        AlertRequest(lat=10.0, lon=92.0, severity=Severity.HIGH, description="Test")

    # Invalid lon
    with pytest.raises(ValidationError):
        AlertRequest(lat=25.0, lon=80.0, severity=Severity.HIGH, description="Test")

def test_enum_validation():
    with pytest.raises(ValidationError):
        AlertRequest(lat=25.0, lon=92.0, severity="UNKNOWN", description="Test")

def test_malicious_input_rejection():
    # Simple length or pattern check for description to prevent XSS/SQLi in pydantic
    class SecureRequest(BaseModel):
        query: str = Field(..., max_length=100, pattern=r'^[a-zA-Z0-9\s]*$')

    with pytest.raises(ValidationError):
        SecureRequest(query="SELECT * FROM users;")
    
    with pytest.raises(ValidationError):
        SecureRequest(query="<script>alert(1)</script>")

def test_pagination_parameters():
    class Pagination(BaseModel):
        limit: int = Field(default=10, ge=1, le=100)
        offset: int = Field(default=0, ge=0)

    p = Pagination(limit=50, offset=10)
    assert p.limit == 50

    with pytest.raises(ValidationError):
        Pagination(limit=200) # Exceeds max
