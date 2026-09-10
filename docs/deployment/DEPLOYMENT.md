# Deployment Guide

## Prerequisites
Ensure the following are installed and configured:
- Docker and Docker Compose
- PostgreSQL with PostGIS extension
- Redis
- MinIO (or AWS S3)
- Google Earth Engine (GEE) Service Account Credentials

## Local Development Setup
To set up the project locally:

```bash
git clone https://github.com/example/xSIH101.git
cd xSIH101
cp .env.example .env
# Edit .env with your real credentials, database URLs, and API keys.

make bootstrap
make dev
```

## Docker Compose Deployment
For a single-node deployment (e.g., staging):
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Kubernetes Deployment
The platform is designed to run on a Kubernetes cluster. Helm charts are provided in the `helm/` directory.
```bash
kubectl create namespace ner-landslide
helm install ner-platform ./helm/ner-platform -n ner-landslide -f values.yaml
```

## Environment-Specific Configuration
Configuration is managed via environment variables. Key variables include:
- `DATABASE_URL`: Connection string for PostGIS.
- `REDIS_URL`: Connection string for Redis.
- `MINIO_URL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`: Storage configs.
- `JWT_SECRET_KEY`: Used for signing authentication tokens.

## Database Migration Procedure
Database schema migrations are handled using Alembic.
```bash
alembic upgrade head
```
To create a new migration:
```bash
alembic revision --autogenerate -m "Add new table"
```

## Secrets Management
Secrets should never be hardcoded or committed. In production, use HashiCorp Vault or AWS Secrets Manager to inject secrets into the containers at runtime.

## Health Check Verification
Verify deployment health by hitting:
- `GET /api/v1/health`
- Checking readiness and liveness probes in K8s.
