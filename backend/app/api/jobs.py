from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import StreamingResponse
from app.db.session import get_db
from app.services.job_service import JobService
from app.services.pubsub_service import PubSubService
from app.schemas.job import JobResponse
import asyncio
import json

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.get("/{id}", response_model=JobResponse)
async def get_job(id: int, db: AsyncSession = Depends(get_db)):
    job = await JobService.get_job(db, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/{id}/retry", response_model=JobResponse)
async def retry_job(id: int, db: AsyncSession = Depends(get_db)):
    job = await JobService.retry_job(db, id)
    if not job:
        # Check if job exists at all to give a better error
        existing_job = await JobService.get_job(db, id)
        if not existing_job:
            raise HTTPException(status_code=404, detail=f"Job {id} not found")
        raise HTTPException(
            status_code=400, 
            detail=f"Job {id} is in state '{existing_job.status}'. Only 'failed' jobs can be retried."
        )
    return job

@router.get("/{id}/stream")
async def job_progress_stream(id: int):
    async def event_generator():
        pubsub = await PubSubService.subscribe_job(id)
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    data = message['data']
                    yield f"data: {data}\n\n"
                    # Break loop if completed or failed
                    payload = json.loads(data)
                    if payload.get("status") in ["completed", "failed"]:
                        break
                await asyncio.sleep(0.1)
        finally:
            await pubsub.unsubscribe()
            await pubsub.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")
