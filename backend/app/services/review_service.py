from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.result import Result
from app.schemas.review import ReviewUpdateRequest, ReviewResponse

class ReviewService:
    @staticmethod
    async def update_review(db: AsyncSession, document_id: int, review_data: ReviewUpdateRequest):
        result = await db.execute(select(Result).where(Result.document_id == document_id))
        db_result = result.scalars().first()

        if not db_result:
            return None

        db_result.reviewed_output_json = review_data.reviewed_output_json
        await db.commit()
        await db.refresh(db_result)
        
        return ReviewResponse.model_validate(db_result)

    @staticmethod
    async def get_review(db: AsyncSession, document_id: int):
        result = await db.execute(select(Result).where(Result.document_id == document_id))
        db_result = result.scalars().first()

        if not db_result:
            return None

        return ReviewResponse.model_validate(db_result)

    @staticmethod
    async def finalize_document(db: AsyncSession, document_id: int):
        result = await db.execute(select(Result).where(Result.document_id == document_id))
        db_result = result.scalars().first()

        if not db_result:
            return None

        db_result.is_finalized = True
        
        import datetime
        db_result.finalized_at = datetime.datetime.utcnow()
        
        # Update Document Status
        from app.models.document import Document
        doc_res = await db.execute(select(Document).where(Document.id == document_id))
        doc = doc_res.scalars().first()
        if doc:
            doc.current_status = "finalized"
            
        await db.commit()
        await db.refresh(db_result)

        return ReviewResponse.model_validate(db_result)
