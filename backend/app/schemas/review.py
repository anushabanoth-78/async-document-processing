from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional

class ReviewUpdateRequest(BaseModel):
    reviewed_output_json: Dict[str, Any]

class ReviewResponse(BaseModel):
    id: int
    document_id: int
    structured_output_json: Optional[Dict[str, Any]] = None
    reviewed_output_json: Optional[Dict[str, Any]] = None
    is_finalized: bool

    model_config = ConfigDict(from_attributes=True)
