from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, health, planner, profile
from app.config import settings
from app.db import Base, engine
from app.models import Reflection, ScheduledBlock, TaskTemplate, User, UserPreferences


def create_app(*, initialize_database: bool = True) -> FastAPI:
    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        if initialize_database:
            # Development convenience. Alembic migrations should own schema changes in production.
            Base.metadata.create_all(bind=engine)
        yield

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router, prefix="/api")
    app.include_router(planner.router, prefix="/api")
    app.include_router(profile.router, prefix="/api")

    return app


app = create_app()
