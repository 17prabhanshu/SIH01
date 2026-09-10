# System Architecture

## Overall Architecture

```text
+-------------------+       +-------------------+       +-------------------+
|   Data Sources    |       |    Processing     |       |   Presentation    |
|                   |       |                   |       |                   |
| +---------------+ |       | +---------------+ |       | +---------------+ |
| | Earth Obs     | |------>| | Ingestion API | |------>| | Web Dashboard | |
| | (GEE/Sentinel)| |       | | (FastAPI)     | |       | | (Next.js)     | |
| +---------------+ |       | +---------------+ |       | +---------------+ |
|                   |       |         |         |       |         ^         |
| +---------------+ |       |         v         |       |         |         |
| | Ground Sensors| |       | +---------------+ |       |         |         |
| | (IoT)         | |------>| | Message Queue | |       |         |         |
| +---------------+ |       | | (RabbitMQ)    | |       |         |         |
|                   |       | +---------------+ |       |         |         |
| +---------------+ |       |         |         |       |         |         |
| | Citizen Data  | |       |         v         |       |         |         |
| | (Mobile App)  | |------>| +---------------+ |       | +---------------+ |
| +---------------+ |       | | Processing    | |------>| | Alerting API  | |
|                   |       | | (Celery)      | |       | | (WebSocket)   | |
|                   |       | +---------------+ |       | +---------------+ |
+-------------------+       +-------------------+       +-------------------+
                                      |
                                      v
                            +-------------------+
                            | Data Storage      |
                            |                   |
                            | - PostgreSQL (Rel)|
                            | - PostGIS (Geo)   |
                            | - MinIO (Object)  |
                            | - Redis (Cache)   |
                            +-------------------+
```

## Data Flow
1. **Ingestion**: Raw data ingested from GEE, IMD APIs, ground sensors, and citizen uploads.
2. **Processing**: Data cleaned, normalized, and stored in PostGIS/MinIO.
3. **Models**: Machine learning models (e.g., LHASA, Susceptibility) infer risks using processed data.
4. **Fusion**: Multi-source data fused to reduce false positives.
5. **Alerts**: High-risk zones trigger alerts sent via WebSocket/Email/SMS.
6. **UI**: Dashboards reflect updated risks and map layers.

## Component Responsibilities
- **FastAPI Backend**: Manages API routing, data ingestion, user authentication, and business logic.
- **Celery Workers**: Background processing for heavy tasks (ML inference, GEE exports).
- **PostGIS**: Stores spatial data (landslide inventory, sensor locations).
- **MinIO**: Stores unstructured data (citizen images, satellite TIFFs).
- **Next.js Frontend**: Renders dynamic interactive maps and dashboards for analysts/admins.

## Communication Patterns
- **REST**: Synchronous API calls from frontend to backend.
- **WebSocket**: Real-time push notifications to clients for critical alerts.
- **Message Queues**: Asynchronous task distribution for ML jobs via RabbitMQ/Redis.

## Security Architecture
- Role-based access control (USER, ANALYST, ADMIN).
- JWT based authentication with short-lived access and long-lived refresh tokens.
- Strict Content-Security-Policies, HSTS, and other security headers.
- Data validation and sanitization for all inputs (especially citizen uploads).

## Deployment Architecture
- **Docker/Kubernetes**: Containerized microservices deployed on K8s for high availability.
- **CI/CD**: Automated testing and deployment pipelines via GitHub Actions.
