from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.session import engine
from app.db.base import Base

from app.api import documents, jobs, review, export, health

from app.services.pubsub_service import redis_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB (in production use Alembic migrations instead)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup
    await redis_client.close()

app = FastAPI(title="Async Document Processor", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(documents.router)
app.include_router(jobs.router)
app.include_router(review.router)
app.include_router(export.router)
