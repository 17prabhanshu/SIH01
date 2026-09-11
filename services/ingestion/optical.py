from typing import Dict, Any

class OpticalAdapter:
    """
    Adapter for Optical Change Detection (e.g., TerraTrack model on Sentinel-2).
    """
    def get_optical_change(self, lat: float, lon: float) -> Dict[str, Any]:
        return {
            "source": "Sentinel-2 / TerraTrack",
            "status": "DEPENDENCY_MISSING",
            "value": None,
            "provenance": {
                "root_cause": "TerraTrack optical model is not implemented in the ML repository, and Gangtok optical data is heavily obscured by monsoon cloud cover (min 35%).",
            }
        }
