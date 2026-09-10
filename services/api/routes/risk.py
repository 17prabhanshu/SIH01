from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from uuid import UUID
from typing import List

from services.api.database import get_db
from services.api.deps import get_current_user
from services.api.models.user import User
from services.api.schemas.risk import RiskAssessment, EvidenceAgreement, ModelEvidence, ExplainabilityReport, ContributingFactor, FactorDirection, ConfidenceReducer

router = APIRouter()

def _mock_risk_assessment() -> RiskAssessment:
    # A realistic sample of the risk assessment structure, even though values are static for the prototype
    return RiskAssessment(
        prediction=0.85,
        probability=0.82,
        uncertainty=0.05,
        evidence_quality=0.9,
        model_agreement=EvidenceAgreement(
            total_models=3,
            agreeing_models=3,
            strongest_evidence=[
                ModelEvidence(
                    model_name="Ensemble_v2",
                    prediction=0.87,
                    confidence=0.92,
                    evidence_strength=0.95,
                    last_updated=datetime.now()
                )
            ],
            weak_uncertain=[]
        ),
        data_freshness=0.95,
        explainability=ExplainabilityReport(
            contributing_factors=[
                ContributingFactor(
                    name="Antecedent Rainfall",
                    direction=FactorDirection.INCREASING_RISK,
                    magnitude=0.7,
                    description="High rainfall in the last 72 hours"
                )
            ],
            confidence_reducers=[]
        )
    )

@router.get("/zone/{zone_id}", response_model=RiskAssessment)
async def get_zone_risk(zone_id: UUID, db: AsyncSession = Depends(get_db)):
    # In reality, fetch actual models, run inference or get cached results
    # using valid real data.
    return _mock_risk_assessment()

@router.get("/location", response_model=RiskAssessment)
async def get_location_risk(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    db: AsyncSession = Depends(get_db)
):
    return _mock_risk_assessment()

@router.get("/overview")
async def get_state_overview(
    state: str,
    db: AsyncSession = Depends(get_db)
):
    # Returns an aggregated view for the state
    return {
        "state": state,
        "high_risk_zones": 12,
        "moderate_risk_zones": 45,
        "overall_trend": "INCREASING"
    }
