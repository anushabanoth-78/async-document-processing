from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.review_service import ReviewService
from app.schemas.review import ReviewUpdateRequest, ReviewResponse

router = APIRouter(prefix="/api/documents/{id}", tags=["review"])

@router.put("/review", response_model=ReviewResponse)
async def update_review(id: int, payload: ReviewUpdateRequest, db: AsyncSession = Depends(get_db)):
    response = await ReviewService.update_review(db, id, payload)
    if not response:
        # Check if the document exists to give a better error message
        from app.services.document_service import DocumentService
        doc = await DocumentService.get_document(db, id)
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {id} not found")
        
        # If document exists but result doesn't, it means extraction is still pending
        raise HTTPException(
            status_code=400, 
            detail=f"Document {id} cannot be reviewed because extraction is not yet completed (current status: {doc.current_status})."
        )
    return response

@router.get("/review", response_model=ReviewResponse)
async def get_review(id: int, db: AsyncSession = Depends(get_db)):
    response = await ReviewService.get_review(db, id)
    if not response:
        from app.services.document_service import DocumentService
        doc = await DocumentService.get_document(db, id)
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {id} not found")
        
        raise HTTPException(
            status_code=404, 
            detail=f"Extraction results for document {id} not found or still processing (current status: {doc.current_status})."
        )
    return response

@router.post("/finalize", response_model=ReviewResponse)
async def finalize_document(id: int, db: AsyncSession = Depends(get_db)):
    response = await ReviewService.finalize_document(db, id)
    if not response:
        # Better error message: check if the document exists but just isn't processed yet
        from app.services.document_service import DocumentService
        doc = await DocumentService.get_document(db, id)
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {id} not found")
        
        raise HTTPException(
            status_code=400, 
            detail=f"Document {id} cannot be finalized because extraction is not yet completed (current status: {doc.current_status})."
        )
    return response
