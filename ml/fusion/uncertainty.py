import numpy as np
from typing import Dict, Any, List

class UncertaintyEngine:
    """Calculates model uncertainty using data quality, agreement, and prediction spread."""
    
    def compute_uncertainty(self, evidence_layers: Dict[str, 'EvidenceLayer']) -> float:
        """
        Calculates aggregate uncertainty for the fused prediction.
        NEVER manufactures fake uncertainty.
        """
        if not evidence_layers:
            return 1.0 # Maximum uncertainty with no data
            
        uncertainties = []
        quality_penalties = []
        
        for name, layer in evidence_layers.items():
            # 1. Calibrated model uncertainty (if available)
            if hasattr(layer, 'uncertainty') and layer.uncertainty is not None:
                uncertainties.append(layer.uncertainty)
                
            # 2. Evidence quality penalty
            if layer.evidence_strength == "UNAVAILABLE":
                quality_penalties.append(1.0)
            elif layer.evidence_strength == "LOW":
                quality_penalties.append(0.5)
            elif layer.evidence_strength == "MEDIUM":
                quality_penalties.append(0.2)
            else:
                quality_penalties.append(0.0)

        # Base uncertainty is average of reported uncertainties
        base_uncertainty = float(np.mean(uncertainties)) if uncertainties else 0.5
        
        # Add penalty for poor quality evidence
        avg_quality_penalty = float(np.mean(quality_penalties)) if quality_penalties else 0.0
        
        # 3. Model agreement uncertainty (ensemble spread)
        probabilities = [layer.probability for layer in evidence_layers.values()]
        ensemble_spread = float(np.std(probabilities)) if len(probabilities) > 1 else 0.0
        
        # Final combined uncertainty bounded between 0 and 1
        final_uncertainty = min(1.0, base_uncertainty * 0.4 + avg_quality_penalty * 0.3 + ensemble_spread * 0.3)
        return final_uncertainty
