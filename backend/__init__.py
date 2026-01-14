from fastapi import FastAPI
from contextlib import asynccontextmanager
from beanie import init_beanie
from pymongo import AsyncMongoClient
import certifi
from backend.core.config import settings
from backend.db.models import Users
from backend.core.auth.routes import router as auth_router
from backend.core.errors import register_exception_handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events for the FastAPI application.
    Initializes database connection on startup and closes it on shutdown.
    """
    # Startup: Initialize database with certifi for SSL/TLS verification
    client = AsyncMongoClient(
        settings.DATABASE_URL,
        tlsCAFile=certifi.where()
    )
    await init_beanie(
        database=client[settings.DB_NAME],
        document_models=[Users]
    )
    print("MongoDB Connected")
    yield
    # Shutdown: Close database connection
    client.close()

app = FastAPI(
    title="Tether API",
    description="API for Tether application with Firebase authentication",
    version="1.0.0",
    lifespan=lifespan
)

# Register exception handlers
register_exception_handlers(app)

# Include routers with /api/v1/ prefix
app.include_router(auth_router, prefix="/api/v1")


@app.get("/")
async def health_check():
    """Root endpoint for health check."""
    return {"message": "Server is working"}

