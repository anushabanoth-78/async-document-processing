from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import os
from app.models.document import Document
from app.models.job import Job
from app.schemas.document import DocumentResponse
from app.services.storage_service import StorageService
from app.services.pubsub_service import PubSubService
from fastapi import UploadFile

storage_service = StorageService()

class DocumentService:
    @staticmethod
    async def upload_document(db: AsyncSession, file: UploadFile) -> DocumentResponse:
        # Validate file type
        allowed_extensions = {".pdf", ".doc", ".docx"}
        allowed_mimes = {
            "application/pdf", 
            "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
        
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in allowed_extensions and file.content_type not in allowed_mimes:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Only PDF and Word documents are allowed. (Got: {file.content_type})"
            )

        # Move import here to break circular dependency
        from app.workers.tasks import process_document

        file_path = await storage_service.save_file(file)
        
        # Create Document
        db_doc = Document(
            original_filename=file.filename,
            stored_file_path=file_path,
            mime_type=file.content_type,
            file_size=file.size
        )
        db.add(db_doc)
        await db.commit()
        await db.refresh(db_doc)

        # Create Job
        db_job = Job(document_id=db_doc.id)
        db.add(db_job)
        await db.commit()
        await db.refresh(db_job)
        
        await PubSubService.publish_job_progress(db_job.id, db_job.status, 0, "job_queued")

        # Trigger Celery Task
        process_document.delay(db_job.id)

        # Create Response manually to include latest_job_id
        response_data = DocumentResponse.model_validate(db_doc)
        response_data.latest_job_id = db_job.id
        return response_data

    @staticmethod
    async def list_documents(db: AsyncSession):
        result = await db.execute(select(Document).order_by(Document.uploaded_at.desc()))
        docs = result.scalars().all()
        
        # Manually attach latest job ID to each document
        document_responses = []
        for doc in docs:
            response = DocumentResponse.model_validate(doc)
            # Find the latest job for this document
            job_result = await db.execute(
                select(Job)
                .where(Job.document_id == doc.id)
                .order_by(Job.created_at.desc())
                .limit(1)
            )
            latest_job = job_result.scalars().first()
            if latest_job:
                response.latest_job_id = latest_job.id
            document_responses.append(response)
            
        return document_responses

    @staticmethod
    async def get_document(db: AsyncSession, document_id: int):
        result = await db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalars().first()
        if doc:
            response = DocumentResponse.model_validate(doc)
            # Find the latest job for this document
            job_result = await db.execute(
                select(Job)
                .where(Job.document_id == document_id)
                .order_by(Job.created_at.desc())
                .limit(1)
            )
            latest_job = job_result.scalars().first()
            if latest_job:
                response.latest_job_id = latest_job.id
            return response
        return None
