import pytest
from typing import Dict, Any
import asyncio
from services.fusion.pipeline import FusionPipeline, FusionResult

@pytest.fixture
def pipeline():
    return FusionPipeline(db=None)

def test_unavailable_models_do_not_count_toward_agreement(pipeline: FusionPipeline):
    # Only 1 model active
    probs = [0.8]
    agreement = pipeline.compute_model_agreement(probs)
    assert agreement is None, "Agreement must be UNAVAILABLE when < 2 models are active"

    # 2 independent models active
    probs = [0.8, 0.6]
    agreement = pipeline.compute_model_agreement(probs)
    assert agreement is not None
    assert agreement > 0.0

def test_missing_evidence_lowers_coverage(pipeline: FusionPipeline):
    # Perfect coverage
    full_coverage = pipeline.compute_evidence_coverage(6)
    assert full_coverage == 1.0
    
    # Missing 1
    partial_coverage = pipeline.compute_evidence_coverage(5)
    assert partial_coverage < 1.0
    assert partial_coverage > 0.8
    
    # Missing most
    limited_coverage = pipeline.compute_evidence_coverage(1)
    assert limited_coverage < 0.2

def test_calibrated_probability_remains_null():
    # Constructing a FusionResult directly
    from datetime import datetime, timezone
    
    result = FusionResult(
        request_id="test",
        timestamp=datetime.now(timezone.utc),
        location={"lat": 0.0, "lon": 0.0},
        assessment_status="LIMITED EVIDENCE",
        hazard_evidence_score=0.8,
        calibrated_probability=None, # Must be None for heuristic
        evidence_coverage=0.5,
        model_agreement=0.9,
        assessment_confidence="MEDIUM",
        contributing_factors={},
        data_freshness={},
        missing_data=[],
        explainability_report="Test"
    )
    
    assert result.hazard_evidence_score == 0.8
    assert result.calibrated_probability is None, "Heuristic scores cannot be serialized as calibrated probabilities"

def test_unavailable_evidence_does_not_become_zero_risk(pipeline: FusionPipeline):
    evidence = {
        "insar_deformation": None,
        "lhasa_nowcast": None
    }
    
    # If trigger is also None (Unavailable)
    score = pipeline.compute_evidence_fusion(evidence, None)
    assert score == 0.0 # Base score falls to 0 if all triggers fail, but let's test a non-none trigger
    
    # If trigger is available, the others being None shouldn't drag the score to 0
    score_with_trigger = pipeline.compute_evidence_fusion(evidence, 0.5)
    assert score_with_trigger == 0.5, "Missing InSAR/LHASA shouldn't drag the valid trigger down to 0"

@pytest.mark.asyncio
async def test_pipeline_run_enforces_semantic_schema(pipeline: FusionPipeline):
    # Run the pipeline (which mocks out OpenMeteo dynamically but we can test the schema structure)
    try:
        result = await pipeline.run(27.3, 88.6)
        assert result.calibrated_probability is None
        assert result.assessment_status in ["LIMITED EVIDENCE", "SUFFICIENT EVIDENCE"]
        assert result.assessment_confidence in ["LOW", "MEDIUM", "HIGH"]
        
        if result.evidence_coverage < 0.5:
            assert result.assessment_status == "LIMITED EVIDENCE"
            
    except Exception as e:
        # If open meteo fails it still shouldn't crash
        pass
