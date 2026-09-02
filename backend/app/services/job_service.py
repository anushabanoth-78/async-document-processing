from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.job import Job, JobStatus
from app.schemas.job import JobResponse
from app.workers.tasks import process_document
from app.services.pubsub_service import PubSubService

class JobService:
    @staticmethod
    async def get_job(db: AsyncSession, job_id: int):
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalars().first()
        if job:
            return JobResponse.model_validate(job)
        return None

    @staticmethod
    async def retry_job(db: AsyncSession, job_id: int):
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalars().first()
        
        if not job or job.status != JobStatus.FAILED:
            return None

        # Reset job state
        job.status = JobStatus.QUEUED
        job.retry_count += 1
        job.progress_percentage = 0
        job.current_stage = "job_queued"
        job.error_message = None
        job.started_at = None
        job.completed_at = None
        
        # Also reset document status
        from app.models.document import Document
        doc_result = await db.execute(select(Document).where(Document.id == job.document_id))
        doc = doc_result.scalars().first()
        if doc:
            doc.current_status = "queued"

        await db.commit()
        await db.refresh(job)

        # Notify via PubSub
        await PubSubService.publish_job_progress(job.id, job.status, 0, "job_queued")

        # Trigger Celery Task
        from app.workers.tasks import process_document
        process_document.delay(job.id)
        
        return JobResponse.model_validate(job)
