# Scientific Assumptions

This document logs all fundamental scientific and operational assumptions underpinning the NER Landslide Early Warning platform. Any changes to these assumptions require a re-evaluation of the modeling pipeline.

## Trigger Mechanisms
- **Monsoon Dominance**: >90% of landslides in the North Eastern Region (NER) are rainfall-induced (monsoon-triggered).
- **SAR-LRA Limitations**: Models like SAR-LRA are explicitly trained and validated for *co-seismic* (earthquake-triggered) events and perform poorly with high false-positive rates for rainfall-triggered events.

## Sensor and Modality Limitations
- **C-band InSAR Decorrelation**: C-band SAR (Sentinel-1, EOS-04) rapidly decorrelates over the dense forest canopies of the NER, often within a single repeat cycle. It is unreliable for vegetative terrain.
- **L-band Penetration**: L-band SAR (NISAR) maintains phase coherence through the forest canopy and is assumed to be the primary radar source for NER slope deformation tracking.
- **Optical Blindness**: Optical tracking methods (TerraTrack, Landslide4Sense, ADSMS) are largely blind during the monsoon season due to persistent cloud cover. They are only highly effective during the dry season (Nov-Apr).
- **PolSAR Assumptions**: The EOS-04 PolSAR Volume Scattering fraction (fveg = H sin(2α)) is derived from agricultural research and is *not* validated for landslide detection or deep forest biomass mapping.

## Data and Modeling Constraints
- **LHASA False Alarms**: The NASA LHASA model exhibits high false alarm rates in South Asian monsoon belts and underrepresents NER in its training data.
- **In-situ Sparsity**: >98% of NER slopes lack in-situ instrumentation (piezometers, inclinometers). Models relying on site-specific instrument data (e.g., direct displacement forecasting models) cannot be scaled across the region.
- **Meteorological Data**: IMD AWS/ARG coverage is sparse in the NER. NASA IMERG satellite rainfall estimates systematically underestimate orographic precipitation in the Himalayas/NER foothills.
- **Foundation Models**: Broad foundation models (e.g., Prithvi, TerraMind) cannot be used zero-shot for NER; they strictly require fine-tuning to adapt to the specific geophysical characteristics of the region.
