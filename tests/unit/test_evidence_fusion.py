import pytest

def compute_weighted_score(evidence: dict, weights: dict) -> float:
    score = 0.0
    for key, val in evidence.items():
        if val is not None:
            score += val * weights.get(key, 0.0)
    return score

def check_confidence_validity(confidence: float) -> bool:
    return 0.0 <= confidence <= 1.0

def test_baseline_weighted_scoring():
    evidence = {'model_a': 0.8, 'model_b': 0.6}
    weights = {'model_a': 0.7, 'model_b': 0.3}
    score = compute_weighted_score(evidence, weights)
    assert round(score, 2) == 0.74

def test_missing_evidence_handling():
    evidence = {'model_a': 0.8, 'model_b': None}
    weights = {'model_a': 0.7, 'model_b': 0.3}
    score = compute_weighted_score(evidence, weights)
    assert round(score, 2) == 0.56

def test_stale_data_penalty():
    score = 0.8
    hours_stale = 24
    penalty = 0.01 * hours_stale
    penalized_score = max(0.0, score - penalty)
    assert round(penalized_score, 2) == 0.56

def test_fake_confidence_rejection():
    assert check_confidence_validity(0.85) == True
    assert check_confidence_validity(1.5) == False
    assert check_confidence_validity(-0.1) == False
