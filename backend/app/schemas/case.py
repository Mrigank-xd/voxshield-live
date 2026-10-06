from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class CaseCreate(BaseModel):
    call_id: str
    investigator_notes: Optional[str] = ""

class CaseUpdate(BaseModel):
    status: Optional[str] = None
    investigator_notes: Optional[str] = None
    recommended_action: Optional[str] = None

class CaseResponse(BaseModel):
    id: str
    case_number: str
    call_id: str
    created_at: datetime
    updated_at: datetime
    status: str
    risk_score: int
    risk_level: str
    investigator_notes: str
    recommended_action: str
    report_generated: bool
    report_path: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
