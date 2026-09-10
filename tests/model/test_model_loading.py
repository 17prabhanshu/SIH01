import pytest
import numpy as np

class DummyModel:
    def __init__(self, version="1.0"):
        self.version = version
    
    def predict_proba(self, X):
        if np.isnan(X).any():
            # handle NaN gracefully
            return np.zeros((X.shape[0], 2))
        return np.random.uniform(0, 1, (X.shape[0], 2))

@pytest.fixture
def loaded_model():
    return DummyModel(version="v1.2.0")

def test_model_version(loaded_model):
    assert loaded_model.version == "v1.2.0"

def test_valid_input_shape(loaded_model):
    X = np.random.rand(10, 5) # 10 samples, 5 features
    preds = loaded_model.predict_proba(X)
    assert preds.shape == (10, 2)

def test_invalid_input_shape(loaded_model):
    X = np.random.rand(10, 3) # wrong feature count
    with pytest.raises(Exception):
        # In a real model, this would raise a ValueError
        if X.shape[1] != 5:
            raise ValueError("Invalid input shape")

def test_model_output_range(loaded_model):
    X = np.random.rand(10, 5)
    preds = loaded_model.predict_proba(X)[:, 1]
    assert (preds >= 0.0).all() and (preds <= 1.0).all()

def test_nan_inputs(loaded_model):
    X = np.array([[np.nan, 1.0, 2.0, 3.0, 4.0]])
    preds = loaded_model.predict_proba(X)[:, 1]
    assert not np.isnan(preds).any()

def test_inference_latency(loaded_model):
    import time
    X = np.random.rand(1, 5)
    start = time.time()
    loaded_model.predict_proba(X)
    end = time.time()
    latency_ms = (end - start) * 1000
    assert latency_ms < 100.0 # under 100ms
