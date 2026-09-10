# License Registry and Compliance Matrix

The NER Landslide Early Warning platform integrates various open-source and proprietary tools. Managing license compatibility is strictly enforced.

## Overall Project License
- **Target Project License**: GPL-3.0 (Forced primarily by the MintPy dependency if tightly integrated, though microservice isolation may permit AGPL/Apache for the main codebase).

## Third-Party Licenses

| Component / Model | License | Compatibility / Action Required |
|-------------------|---------|---------------------------------|
| **MintPy** | GPL-3.0-or-later (Strict Copyleft) | Must isolate as a separate container/service to prevent forced open-sourcing of the entire proprietary backend, or accept GPL-3.0 for the whole project. |
| **NASA LHASA** | NOSA v1.3 | GPL-incompatible! Must execute LHASA as a standalone process and consume its outputs. Do not import its code directly as a library into a GPL project. |
| **SAR-LRA Weights & L4S Data** | CC BY 4.0 | Compatible. Requires explicit attribution in documentation and UI. |
| **TerraTorch** | Apache 2.0 | GPL-compatible. Can be safely integrated. |
| **TorchGeo, TerraTrack, Attention U-Net, ADSMS, L4S Code** | MIT | Compatible. Permissive, requires copyright notice inclusion. |
| **Displacement Forecasting Repo** | NONE (All Rights Reserved) | **CRITICAL BLOCKER**. Cannot use, read, or derive from this code directly. Must independently implement similar architectures from scratch based on paper descriptions. |

## Government Data Policies
- **GSI (Bhusanket/Bhukosh)**: Data is restricted. Requires official credentials. Cannot be publicly redistributed without permission.
- **IMD Data**: Requires registration and IP whitelisting. Cannot be commercially resold.
- **EOS-04 (ISRO)**: Free for government entities (>5m resolution). Subject to ISRO's data dissemination policies.
