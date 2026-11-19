"""FastAPI application factory for JobRadar."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from jobradar.api.routes import router
from jobradar.core.config import load_settings
from jobradar.db.engine import init_db

logger = logging.getLogger("jobradar.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context for DB initialization and startup routines."""
    logger.info("Initializing database schema...")
    init_db()
    yield
    logger.info("Application shutdown complete.")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = load_settings()

    app = FastAPI(
        title="JobRadar Backend API",
        version="1.0.0",
        description="Versioned Change-Tracking System for Student Internship and Job Listings",
        lifespan=lifespan,
    )

    # Enable CORS for local dev servers and clients
    origins = settings.cors_origins or ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins if "*" not in origins else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router)

    @app.get("/")
    def root():
        return {
            "name": "JobRadar API",
            "version": "1.0.0",
            "docs": "/docs",
            "status": "online",
        }

    return app


app = create_app()
