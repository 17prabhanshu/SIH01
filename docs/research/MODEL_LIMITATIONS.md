# Model Limitations

This document details the specific technical and scientific limitations of the models evaluated for the platform.

## NASA LHASA
- **Trigger**: Exclusively rainfall-triggered. PGA is used as a static preconditioning feature, not a real-time seismic trigger.
- **Training**: Cannot be retrained from the open-source repository (only inference scripts are provided).
- **Anthropogenic Factors**: Completely blind to anthropogenic conditioning (e.g., road cuts, urban terracing), which are major landslide drivers in the NER.
- **False Alarms**: High false alarm rate during the South Asian monsoon.

## SAR-LRA (Cambridge)
- **Scope**: Exclusively co-seismic.
- **False Positives**: Generates massive false positives during the monsoon due to changes in soil moisture and canopy wetting mimicking displacement/damage.
- **NER Applicability**: Extremely poor for standard operations; useful only post-earthquake.

## Attention U-Net SAR
- **Generalization**: Severely overfits to the Hokkaido 2018 earthquake (volcanic tephra soil conditions).
- **Status**: Abandoned since 2022.

## MintPy
- **Latency**: Cannot perform rapid post-disaster mapping. It relies on SBAS time-series analysis for slow-moving deformation.
- **Band Limitations**: Heavily constrained at C-band. Requires L-band data for utility in the NER.

## Landslide4Sense (L4S)
- **Weather Constraint**: Optical data dependency renders it blind during the monsoon cloud cover.

## TerraTrack
- **Canopy Decorrelation**: Suffers from dense canopy decorrelation problems, preventing accurate pixel-tracking in forested areas.
- **Seasonal Constraint**: Moderate applicability, strictly limited to the dry season.

## TerraTorch
- **Compute Heavy**: Requires enterprise-grade GPUs (A100/H100) for training and fine-tuning large foundation models.
- **Serving Complexity**: Requires complex MLOps pipelines (ONNX/Triton) for production serving.

## Displacement Forecasting (Various Architectures)
- **Data Dependency**: Strictly site-specific. Requires heavily instrumented slopes which do not exist for 98% of the NER.
- **Licensing**: Unlicensed code prevents any direct usage.
