from dataclasses import dataclass
from typing import Dict, Optional, Tuple

@dataclass
class IDThreshold:
    """Intensity-Duration empirical threshold parameters: I = c * D^(-alpha)"""
    c: float
    alpha: float
    reference: str

@dataclass
class CumulativeThreshold:
    """Cumulative rainfall thresholds."""
    daily_mm: float
    antecedent_3d_mm: float
    antecedent_7d_mm: float

class EmpiricalThresholds:
    """
    Registry and evaluator for NER-specific empirical rainfall thresholds.
    These are calibrated from GSI/NLFC and published literature.
    """
    
    def __init__(self):
        # Example calibration values for North Eastern Region
        self.id_thresholds: Dict[str, IDThreshold] = {
            "Sikkim": IDThreshold(c=15.5, alpha=0.45, reference="GSI 2021"),
            "Assam": IDThreshold(c=12.2, alpha=0.38, reference="Regional Literature"),
            "Meghalaya": IDThreshold(c=25.0, alpha=0.55, reference="Cherrapunji localized model"),
            "Default_NER": IDThreshold(c=14.0, alpha=0.42, reference="Pan-NER baseline")
        }
        
        self.cumulative_thresholds: Dict[str, CumulativeThreshold] = {
            "Sikkim": CumulativeThreshold(120.0, 180.0, 250.0),
            "Assam": CumulativeThreshold(100.0, 150.0, 200.0),
            "Default_NER": CumulativeThreshold(110.0, 160.0, 220.0)
        }

    def evaluate_id_threshold(self, state: str, intensity_mm_h: float, duration_h: float) -> Tuple[bool, float]:
        """
        Evaluate if Intensity-Duration threshold is exceeded.
        
        Returns:
            Tuple of (is_exceeded, margin_of_safety)
        """
        threshold = self.id_thresholds.get(state, self.id_thresholds["Default_NER"])
        critical_intensity = threshold.c * (duration_h ** -threshold.alpha)
        
        margin = critical_intensity - intensity_mm_h
        return (intensity_mm_h > critical_intensity), margin

    def evaluate_cumulative_threshold(self, state: str, daily: float, ant_3d: float, ant_7d: float) -> Tuple[bool, str]:
        """
        Evaluate if cumulative thresholds are exceeded.
        
        Returns:
            Tuple of (is_exceeded, critical_factor)
        """
        threshold = self.cumulative_thresholds.get(state, self.cumulative_thresholds["Default_NER"])
        
        if daily > threshold.daily_mm:
            return True, "daily"
        if ant_3d > threshold.antecedent_3d_mm:
            return True, "3-day antecedent"
        if ant_7d > threshold.antecedent_7d_mm:
            return True, "7-day antecedent"
            
        return False, "safe"
