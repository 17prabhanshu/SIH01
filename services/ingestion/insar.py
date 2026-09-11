from typing import Dict, Any

class InSarAdapter:
    """
    Adapter for processing InSAR deformation data (e.g., MintPy output from Sentinel-1 SLCs).
    Currently returns UNAVAILABLE because Sentinel-1 SLC data download via ASF DAAC 
    requires NASA Earthdata authentication which is not configured.
    """
    def get_deformation_velocity(self, lat: float, lon: float) -> Dict[str, Any]:
        return {
            "source": "ASF DAAC / MintPy",
            "status": "AUTH_REQUIRED",
            "value": None,
            "provenance": {
                "root_cause": "Earthdata Login required to download bulk Sentinel-1 SLC products for InSAR processing.",
                "recovery_path": "Provide valid NASA Earthdata credentials in the environment."
            }
        }
