# Technology Decisions

This document outlines the strategic technology choices for the NER Landslide Early Warning platform, based on detailed research into available models, frameworks, and tools.

## Model and Algorithm Decisions

- **NASA LHASA**: USE as a regional macro-nowcast layer (clipped to the NER bounding box 21.5-29.5N, 88-97.5E). DO NOT USE as a site-specific predictor.
- **SAR-LRA (Cambridge)**: USE ONLY as a secondary post-earthquake event detection mechanism. DO NOT USE for monsoon/rainfall-triggered monitoring.
- **Attention U-Net SAR**: DO NOT USE. It is superseded by SAR-LRA, overfitted to a specific event, and entirely inapplicable to NER conditions.
- **MintPy**: USE for critical infrastructure InSAR monitoring (slow-moving deformation). ISOLATE as a GPL container/microservice to avoid license contamination.
- **Landslide4Sense**: USE as a benchmark dataset for pre-training and validation of custom models.
- **TerraTrack**: USE for dry-season optical displacement tracking (Nov-Apr). Note it is blind during the monsoon.
- **TerraTorch**: USE for foundation model fine-tuning (e.g., Prithvi/TerraMind + Landslide4Sense) to leverage few-shot transfer learning.
- **TorchGeo**: USE as the foundational geospatial ML library. It is robust, handles UTM Zones properly, and is production-ready.
- **ADSMS-UNet**: EXTRACT architectural principles only. DO NOT use the raw code (Jupyter notebook heavy, unmaintained). Re-implement concepts in PyTorch/TorchGeo.
- **Displacement Forecasting**: IMPLEMENT SIMILAR architectures (MLP for peak acceleration, GRU/LSTM for gradual trends). DO NOT use the repository directly due to lack of an open-source license.

## Infrastructure and Stack Decisions

- **Database**: PostgreSQL 16 + PostGIS 3.4
- **Cache**: Redis 7
- **Object Storage**: MinIO (for development) / S3-compatible (for production)
- **Backend API**: FastAPI (Python 3.12) - High performance, asynchronous, excellent typing support.
- **Frontend**: Next.js + TypeScript + Tailwind CSS + shadcn/ui + MapLibre (for rendering heavy vector/raster data).
- **Task Queue**: Start with a Redis-based queue (Celery or ARQ). Evaluate RabbitMQ/Kafka if scale justifies it.
- **Model Serving**: FastAPI for lightweight models. Evaluate BentoML/Triton for GPU-heavy inference.
- **Containerization**: Docker
- **Orchestration**: Docker Compose (for local development/testing), Kubernetes (for staging/production).

## Government & Security Compliance
- **GIGW 3.0**: Must ensure WCAG 2.1 AA compliance, bilingual support (English+Hindi).
- **Security Audit**: CERT-In Safe-to-Host audit required. STQC CQW certification targeted.
- **DPDP 2025 Act**: Ensure 72-hour breach notification capabilities, multilingual consent forms, data erasure workflows.
