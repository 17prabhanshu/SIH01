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
COPY garjana/ garjana/
COPY config/ config/
COPY train/ train/

EXPOSE 8000

CMD ["uvicorn", "garjana.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
