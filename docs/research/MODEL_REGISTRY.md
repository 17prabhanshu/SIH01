# Model Registry

This registry tracks all investigated ML/AI models for the NER Landslide Early Warning platform, assessing their applicability, limitations, and integration complexity.

| Model | License | Modality | Output | Scope | Trigger | Validation Region | Validation Metrics | NER Applicability | Integration Complexity | Production Suitability |
|-------|---------|----------|--------|-------|---------|-------------------|--------------------|-------------------|------------------------|------------------------|
| **NASA LHASA** | NOSA v1.3 (GPL-incompatible) | Rainfall, Static (Slope, Lithology, PGA, soil wetness) | Nowcast probability | Global 1km (60N-60S) | Rainfall | Global | AUC 0.80-0.82 | Moderate-High (requires clipping) | Low (inference only) | High |
| **SAR-LRA (Cambridge)** | Code Unlicensed / CC BY 4.0 data/weights | SAR (Sentinel-1 GRD) | Displacement/Change | Earthquake regions | Co-seismic | Haiti, Sumatra | F1 up to 82% | Poor (>90% NER slides are monsoon) | Moderate (GEE, TF) | Low-Moderate |
| **Attention U-Net SAR** | MIT | SAR | Segmentation | Single event (Hokkaido) | Co-seismic | Hokkaido (2018) | F1 61% | Zero (overfitted) | High | Low |
| **MintPy** | GPL-3.0-or-later | InSAR time-series | Displacement | Global | Slow-moving | Diverse | N/A (Methodology) | Moderate (requires L-band NISAR for forests) | Very High (requires ISCE-2/SNAP) | High (isolated microservice) |
| **Landslide4Sense** | MIT (code) / CC BY 4.0 (data) | Optical (14 bands, Sentinel-2+DEM) | Segmentation | Regional (4 areas) | Mixed | Hokkaido, Kodagu, Gorkha, Taitung | U-Net F1 57.82%, top 78-82% | High (Gorkha/Kodagu analogs) | Low (Benchmark) | Moderate (Pre-training) |
| **TerraTrack** | MIT | Optical (Sentinel-2) | Optical flow displacement | Sub-pixel | Slow-moving | Diverse | ~1-2m cumulative displacement | Moderate (dry season only) | Low (GEE based) | Moderate |
| **TerraTorch** | Apache 2.0 | Multi-modal Foundation Models | Various | Global Foundation | Various | Various | Various (SOTA) | High (Fine-tuning required) | High (Needs A100/H100) | High |
| **TorchGeo** | MIT | Foundational ML lib | N/A | N/A | N/A | N/A | N/A | High (Handles UTM Zone 45N/46N) | Low | High |
| **ADSMS-UNet** | MIT | VHR Optical | Segmentation | Earthquake regions | Co-seismic | Wenchuan, Gorkha | High accuracy | Moderate (Extract arch principles) | Moderate (PyTorch port needed) | Low (Raw code), High (Ported) |
| **Displacement Forecasting** | NONE (All Rights Reserved) | Tabular time-series | Displacement | Site-specific | Various | Site-specific | Varies (MLP, GRU/LSTM best) | Poor (Requires in-situ instruments) | N/A (Legal blocker) | N/A |
