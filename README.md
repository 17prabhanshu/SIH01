# NER Landslide Early Warning & Risk Monitoring System

## Overview
The NER Landslide Early Warning & Risk Monitoring System is a multimodal geospatial intelligence platform designed for the North Eastern Region of India. It provides real-time and predictive insights into landslide hazards, enabling proactive risk mitigation and disaster response.

Built to government-grade standards, the system integrates diverse data sources—including optical and synthetic aperture radar (SAR) satellite imagery, meteorological data, and geological surveys—to model complex landslide dynamics.

## Architecture
The system architecture models the complete landslide lifecycle through six core pillars:
1. **Susceptibility**: Static baseline mapping of landslide-prone areas based on geology, topography, and historical data.
2. **Trigger**: Dynamic monitoring of triggering factors, primarily rainfall intensity and duration.
3. **Deformation**: Continuous measurement of ground movement using InSAR techniques.
4. **Event Evidence**: Rapid detection of recent landslide events using optical and SAR imagery change detection.
5. **Exposure**: Mapping of critical infrastructure, settlements, and populations in hazard zones.
6. **Consequence**: Assessment of potential impact and economic loss.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, PostGIS
- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Geospatial**: GDAL, Rasterio, GeoPandas, MintPy (for InSAR)
- **Machine Learning**: PyTorch, Scikit-learn
- **Data Infrastructure**: PostgreSQL, Redis, MinIO
- **Deployment**: Docker, Kubernetes

## Setup Instructions
Please refer to the `docs/deployment/` directory for detailed setup instructions. The basic local development environment can be launched using Docker Compose.

## License
This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details. Note: The GPL-3.0 license is required due to dependencies on GPL-licensed software (e.g., MintPy).

## Acknowledgments
This project originates from the Smart India Hackathon (SIH) and is developed as a production-grade platform for deployment in real-world scenarios.
