from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.result import Result
import json
import csv
import io

class ExportService:
    @staticmethod
    async def get_result(db: AsyncSession, document_id: int):
        result = await db.execute(select(Result).where(Result.document_id == document_id))
        return result.scalars().first()

    @staticmethod
    async def export_json(db: AsyncSession, document_id: int):
        result = await ExportService.get_result(db, document_id)
        if not result:
            return {"error": "not_found", "message": f"No extraction result found for document {document_id}."}
        if not result.is_finalized:
            return {"error": "not_finalized", "message": f"Result for document {document_id} is not finalized yet."}
        return result.reviewed_output_json

    @staticmethod
    async def export_csv(db: AsyncSession, document_id: int):
        result = await ExportService.get_result(db, document_id)
        if not result:
            return None # Handle in API layer
        if not result.is_finalized or not result.reviewed_output_json:
            return None

        data = result.reviewed_output_json
        
        # Flatten dictionary if nested
        def flatten_dict(d, parent_key='', sep='_'):
            items = []
            for k, v in d.items():
                new_key = f"{parent_key}{sep}{k}" if parent_key else k
                if isinstance(v, dict):
                    items.extend(flatten_dict(v, new_key, sep=sep).items())
                else:
                    items.append((new_key, v))
            return dict(items)

        if isinstance(data, dict):
            flat_data = flatten_dict(data)
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(flat_data.keys())
            writer.writerow(flat_data.values())
            return output.getvalue()
        
        return None
