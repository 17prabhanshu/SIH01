from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class FactorDirection(str, Enum):
    INCREASING_RISK = "INCREASING_RISK"
    DECREASING_RISK = "DECREASING_RISK"
    NEUTRAL = "NEUTRAL"

class ContributingFactor(BaseModel):
    name: str
    direction: FactorDirection
    magnitude: float
    description: str

class ConfidenceReducer(BaseModel):
    reason: str
    impact: float

class ExplainabilityReport(BaseModel):
    contributing_factors: List[ContributingFactor]
    confidence_reducers: List[ConfidenceReducer]

class ModelEvidence(BaseModel):
    model_name: str
    prediction: float
    confidence: float
    evidence_strength: float
    last_updated: datetime

class EvidenceAgreement(BaseModel):
    total_models: int
    agreeing_models: int
    strongest_evidence: List[ModelEvidence]
    weak_uncertain: List[ModelEvidence]

class RiskAssessment(BaseModel):
    prediction: float
    probability: float
    uncertainty: float
    evidence_quality: float
    model_agreement: EvidenceAgreement
    data_freshness: float
    explainability: Optional[ExplainabilityReport] = None
