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
    return _mock_risk_assessment()

@router.get("/evaluate")
async def evaluate_risk(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    db: AsyncSession = Depends(get_db)
):
    from services.fusion.pipeline import FusionPipeline
    from services.fusion.exposure import ExposureEngine
    from services.alerts.engine import AlertEngine
    
    pipeline = FusionPipeline(db)
    fusion_result = await pipeline.run(lat, lon)
    
    exposure_engine = ExposureEngine()
    exposure_result = await exposure_engine.get_exposure_metrics(lat, lon)
    
    alert_engine = AlertEngine(db_session=db)
    alert = await alert_engine.evaluate(fusion_result, exposure_result)
    
    return {
        "fusion_result": {
            "hazard_evidence_score": fusion_result.hazard_evidence_score,
            "evidence_coverage": fusion_result.evidence_coverage,
            "assessment_status": fusion_result.assessment_status,
            "assessment_confidence": fusion_result.assessment_confidence,
            "data_freshness": fusion_result.data_freshness,
            "explainability_report": fusion_result.explainability_report,
            "contributing_factors": fusion_result.contributing_factors
        },
        "exposure_result": exposure_result,
        "alert": alert.dict() if alert else None
    }

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
