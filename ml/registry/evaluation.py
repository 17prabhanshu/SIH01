from typing import Dict, Any, Optional
import numpy as np
from sklearn.metrics import roc_auc_score, average_precision_score, f1_score, brier_score_loss
from sklearn.calibration import calibration_curve

class EvaluationFramework:
    """
    Standardized evaluation framework for all ML models.
    Will refuse to fabricate metrics if real data is missing.
    """
    
    @staticmethod
    def evaluate_classification(
        y_true: np.ndarray, 
        y_prob: np.ndarray, 
        y_pred: Optional[np.ndarray] = None,
        is_authoritative: bool = False
    ) -> Dict[str, Any]:
        """
        Evaluate classification metrics, strictly blocking synthetic data
        from populating production registry metrics.
        """
        if not is_authoritative:
            return {
                "status": "BLOCKED",
                "reason": "AUTHORITATIVE NER LABELS UNAVAILABLE. Fake metrics will not be generated.",
                "metrics": {}
            }
            
        if y_pred is None:
            y_pred = (y_prob >= 0.5).astype(int)
            
        metrics = {
            "roc_auc": float(roc_auc_score(y_true, y_prob)),
            "pr_auc": float(average_precision_score(y_true, y_prob)),
            "f1": float(f1_score(y_true, y_pred)),
            "brier_score": float(brier_score_loss(y_true, y_prob))
        }
        
        # Calibration error
        prob_true, prob_pred = calibration_curve(y_true, y_prob, n_bins=10)
        metrics["expected_calibration_error"] = float(np.mean(np.abs(prob_true - prob_pred)))
        
        return {
            "status": "VALIDATED",
            "reason": "Evaluated against authoritative held-out data.",
            "metrics": metrics
        }
