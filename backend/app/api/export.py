from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse, Response
from app.db.session import get_db
from app.services.export_service import ExportService

router = APIRouter(prefix="/api/documents/{id}/export", tags=["export"])

@router.get("/json")
async def export_json(id: int, db: AsyncSession = Depends(get_db)):
    data = await ExportService.export_json(db, id)
    if isinstance(data, dict) and "error" in data:
        if data["error"] == "not_found":
            raise HTTPException(status_code=404, detail=data["message"])
        else:
            raise HTTPException(status_code=400, detail=data["message"])
    return JSONResponse(content=data)

@router.get("/csv")
async def export_csv(id: int, db: AsyncSession = Depends(get_db)):
    csv_data = await ExportService.export_csv(db, id)
    if not csv_data:
        # Check why it's None to give better feedback
        result = await ExportService.get_result(db, id)
        if not result:
            raise HTTPException(status_code=404, detail=f"No extraction result found for document {id}.")
        if not result.is_finalized:
            raise HTTPException(status_code=400, detail=f"Result for document {id} is not finalized yet.")
        raise HTTPException(status_code=400, detail="CSV export failed due to invalid data format.")
    
    return Response(content=csv_data, media_type="text/csv")
