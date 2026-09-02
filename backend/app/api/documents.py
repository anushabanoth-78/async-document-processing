from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import get_db
from app.services.document_service import DocumentService
from app.schemas.document import DocumentResponse

from app.schemas.job import JobResponse
from app.services.job_service import JobService
from sqlalchemy.future import select
from app.models.job import Job

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    return await DocumentService.upload_document(db, file)

@router.get("", response_model=List[DocumentResponse])
async def list_documents(db: AsyncSession = Depends(get_db)):
    return await DocumentService.list_documents(db)

@router.get("/{id}", response_model=DocumentResponse)
async def get_document(id: int, db: AsyncSession = Depends(get_db)):
    doc = await DocumentService.get_document(db, id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{id}/job", response_model=JobResponse)
async def get_document_latest_job(id: int, db: AsyncSession = Depends(get_db)):
    # Verify document exists
    doc = await DocumentService.get_document(db, id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Get latest job for this document
    result = await db.execute(
        select(Job)
        .where(Job.document_id == id)
        .order_by(Job.created_at.desc())
        .limit(1)
    )
    job = result.scalars().first()
    if not job:
        raise HTTPException(status_code=404, detail="No job found for this document")
    return JobResponse.model_validate(job)
