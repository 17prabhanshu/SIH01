import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from services.api.config import settings
from services.api.routes import api_router
from services.api.middleware.request_id import RequestIdMiddleware
from services.api.middleware.rate_limit import RateLimitMiddleware
from services.api.middleware.logging import LoggingMiddleware
from services.api.database import engine

# Setup Logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("api")

app = FastAPI(
    title=settings.TITLE,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    openapi_tags=[
        {"name": "health", "description": "System health and readiness"},
        {"name": "risk", "description": "Landslide risk intelligence"},
        {"name": "alerts", "description": "Early warning alerts"},
        {"name": "reports", "description": "Citizen reporting"},
        {"name": "system", "description": "System integration status"}
    ]
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestIdMiddleware)

# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "code": "VALIDATION_ERROR",
            "message": "Invalid request parameters",
            "details": exc.errors(),
            "request_id": getattr(request.state, "request_id", None)
        }
    )

@app.exception_handler(SQLAlchemyError)
async def db_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "code": "DATABASE_ERROR",
            "message": "An internal database error occurred",
            "request_id": getattr(request.state, "request_id", None)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
            "request_id": getattr(request.state, "request_id", None)
        }
    )

# Routes
app.include_router(api_router)

# Startup/Shutdown Events
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up NER Landslide API")
    # Initialize redis pool, minio client, load models, etc.

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down NER Landslide API")
    await engine.dispose()
