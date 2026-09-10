from typing import List, Dict, Any

class ModelAgreementTracker:
    """Tracks predictions across independent models and computes agreement metrics."""
    
    def __init__(self):
        pass

    def compute_agreement(self, evidence_layers: Dict[str, 'EvidenceLayer']) -> Dict[str, Any]:
        """
        Compute how many models predict HIGH/MEDIUM/LOW and identify consensus.
        """
        high_models = []
        medium_models = []
        low_models = []
        
        for name, layer in evidence_layers.items():
            if layer.probability >= 0.7:
                high_models.append(name)
            elif layer.probability >= 0.4:
                medium_models.append(name)
            else:
                low_models.append(name)
                
        total_models = len(evidence_layers)
        
        # Determine Consensus
        if len(high_models) >= total_models / 2:
            consensus = "HIGH"
            agreeing = len(high_models)
        elif len(low_models) >= total_models / 2:
            consensus = "LOW"
            agreeing = len(low_models)
        else:
            consensus = "MIXED"
            agreeing = len(medium_models)
            
        # Analyze strongest evidence and weak ones
        sorted_layers = sorted(evidence_layers.items(), key=lambda x: x[1].probability, reverse=True)
        
        strongest = []
        for name, layer in sorted_layers:
            if layer.evidence_strength in ["HIGH", "MEDIUM"] and layer.probability > 0.5:
                strongest.append({
                    "model": name,
                    "reason": f"Predicted {layer.probability:.2f} probability with {layer.evidence_strength} confidence."
                })
                
        weak_uncertain = []
        for name, layer in sorted_layers:
            if layer.evidence_strength in ["LOW", "UNAVAILABLE"] or layer.uncertainty > 0.5:
                weak_uncertain.append({
                    "model": name,
                    "reason": f"High uncertainty ({layer.uncertainty:.2f}) or weak evidence strength."
                })
                
        return {
            "total_models": total_models,
            "agreeing_count": agreeing,
            "consensus": consensus,
            "strongest_evidence": strongest,
            "weak_uncertain": weak_uncertain
        }
