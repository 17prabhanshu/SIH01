import json
import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, average_precision_score, f1_score, precision_score, recall_score, brier_score_loss, calibration_curve
import logging

logger = logging.getLogger(__name__)

class SusceptibilityModel:
    """
    Machine Learning model for static landslide susceptibility mapping.
    Wraps scikit-learn models with spatial validation and calibration support.
    """
    
    def __init__(self, model_type: str = "rf", calibration: bool = True):
        self.model_type = model_type
        self.calibration = calibration
        self.feature_names: List[str] = []
        
        if model_type == "rf":
            base_estimator = RandomForestClassifier(
                n_estimators=100, 
                max_depth=15, 
                class_weight="balanced",
                n_jobs=-1,
                random_state=42
            )
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
            
        if calibration:
            self.model = CalibratedClassifierCV(base_estimator, method='isotonic', cv=5)
        else:
            self.model = base_estimator
            
        self.is_trained = False
        
    def train(self, features: np.ndarray, labels: np.ndarray, spatial_holdout_config: Dict[str, np.ndarray]) -> Dict[str, Any]:
        """
        Train the model using spatial holdout validation.
        
        Args:
            features: 2D array of shape (n_samples, n_features)
            labels: 1D array of shape (n_samples,) binary labels
            spatial_holdout_config: Dict with 'train_mask', 'val_mask', 'test_mask' indicating split
        """
        logger.info("Starting susceptibility model training with spatial holdout.")
        
        train_mask = spatial_holdout_config.get('train_mask')
        test_mask = spatial_holdout_config.get('test_mask')
        
        if train_mask is None or test_mask is None:
            raise ValueError("Spatial holdout requires explicit 'train_mask' and 'test_mask'.")
            
        X_train, y_train = features[train_mask], labels[train_mask]
        X_test, y_test = features[test_mask], labels[test_mask]
        
        # Fit model
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        # Evaluate
        metrics = self._evaluate(X_test, y_test)
        logger.info(f"Training completed. Spatial holdout metrics: {metrics}")
        
        return metrics

    def _evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
        """Calculates performance metrics on holdout set."""
        probs = self.model.predict_proba(X_test)[:, 1]
        preds = self.model.predict(X_test)
        
        roc_auc = roc_auc_score(y_test, probs)
        pr_auc = average_precision_score(y_test, probs)
        f1 = f1_score(y_test, preds)
        precision = precision_score(y_test, preds)
        recall = recall_score(y_test, preds)
        brier = brier_score_loss(y_test, probs)
        
        # Calibration error (Expected Calibration Error approximation)
        prob_true, prob_pred = calibration_curve(y_test, probs, n_bins=10)
        calibration_error = np.mean(np.abs(prob_true - prob_pred))
        
        return {
            "roc_auc": float(roc_auc),
            "pr_auc": float(pr_auc),
            "f1": float(f1),
            "precision": float(precision),
            "recall": float(recall),
            "brier_score": float(brier),
            "calibration_error": float(calibration_error)
        }
        
    def predict(self, features: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict susceptibility probabilities and estimate uncertainty.
        
        Args:
            features: 2D array of shape (n_samples, n_features)
            
        Returns:
            Tuple of (probabilities, uncertainties)
        """
        if not self.is_trained:
            raise RuntimeError("Model must be trained before calling predict.")
            
        probabilities = self.model.predict_proba(features)[:, 1]
        
        # Uncertainty estimation: if RF, use variance of trees
        if self.calibration:
            base_rf = self.model.estimator
        else:
            base_rf = self.model
            
        if isinstance(base_rf, RandomForestClassifier):
            # Collect predictions from all trees
            tree_preds = np.array([tree.predict_proba(features)[:, 1] for tree in base_rf.estimators_])
            uncertainty = np.std(tree_preds, axis=0)
        else:
            # Fallback uncertainty
            uncertainty = np.zeros_like(probabilities)
            
        return probabilities, uncertainty

    def extract_feature_importance(self) -> Dict[str, float]:
        """Extract SHAP/Gini feature importance."""
        if not self.is_trained:
            raise RuntimeError("Model not trained.")
            
        if self.calibration:
            base_rf = self.model.estimator
        else:
            base_rf = self.model
            
        if hasattr(base_rf, 'feature_importances_'):
            importances = base_rf.feature_importances_
            if not self.feature_names:
                self.feature_names = [f"Feature_{i}" for i in range(len(importances))]
            return dict(zip(self.feature_names, importances))
        
        return {}

    def save(self, filepath: str) -> None:
        """Serialize model."""
        import joblib
        joblib.dump({
            "model": self.model,
            "feature_names": self.feature_names,
            "is_trained": self.is_trained
        }, filepath)
        
    def load(self, filepath: str) -> None:
        """Deserialize model."""
        import joblib
        data = joblib.load(filepath)
        self.model = data["model"]
        self.feature_names = data["feature_names"]
        self.is_trained = data["is_trained"]
