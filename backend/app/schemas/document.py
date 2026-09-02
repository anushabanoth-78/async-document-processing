from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: int
    original_filename: str
    stored_file_path: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    uploaded_at: datetime
    current_status: str
    latest_job_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
