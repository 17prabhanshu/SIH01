import os
from enum import Enum
from pydantic_settings import BaseSettings, SettingsConfigDict

class DataMode(str, Enum):
    LIVE = "LIVE"
    HISTORICAL_REPLAY = "HISTORICAL_REPLAY"
    CACHED = "CACHED"
    DEGRADED = "DEGRADED"

class Settings(BaseSettings):
    # App Settings
    TITLE: str = "NER Landslide Early Warning API"
    DESCRIPTION: str = "Government-grade API for Landslide Early Warning Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Services
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/landslide_db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    
    # Platform Mode
    DATA_MODE: DataMode = DataMode.LIVE
    
    # External APIs
    GEE_PROJECT: str = "gee-project-id"
    GEE_SERVICE_ACCOUNT_KEY_PATH: str = "/var/secrets/gee/sa.json"
    IMD_API_BASE_URL: str = "https://api.imd.gov.in/v1"
    IMD_API_KEY: str = ""
    
    # Security
    JWT_SECRET: str = "super_secret_change_me_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    API_RATE_LIMIT_PER_MINUTE: int = 100
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
