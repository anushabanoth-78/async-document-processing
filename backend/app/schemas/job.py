from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class JobResponse(BaseModel):
    id: int
    document_id: int
    status: str
    progress_percentage: int
    current_stage: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: int
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
