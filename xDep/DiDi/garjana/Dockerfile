FROM python:3.11-slim

WORKDIR /app

# System dependencies for GDAL, PostGIS client, HDF5
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ libgdal-dev libpq-dev libhdf5-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e ".[dev]" || pip install --no-cache-dir .

# Application code
COPY api/ api/
COPY core/ core/
COPY align/ align/
COPY config/ config/
COPY db/ db/
COPY decision/ decision/
COPY forecast/ forecast/
COPY hazards/ hazards/
COPY objects/ objects/
COPY providers/ providers/
COPY qc/ qc/
COPY replay/ replay/
COPY workers/ workers/
COPY verify/ verify/
COPY train/ train/

EXPOSE 8000

ENV PYTHONPATH=/app

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
