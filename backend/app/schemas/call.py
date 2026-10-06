from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class CallCreate(BaseModel):
    caller_name: Optional[str] = "Unknown Caller"
    caller_number: Optional[str] = "+1 (555) 019-2831"
    call_type: Optional[str] = "audio" # audio or video
    provider: Optional[str] = "webrtc" # webrtc, mock, sip
    privacy_mode: Optional[bool] = False
    consent_given: Optional[bool] = True

class CallResponse(BaseModel):
    id: str
    session_token: str
    caller_name: str
    caller_number: str
    call_type: str
    status: str
    provider: str
    consent_given: bool
    privacy_mode: bool
    created_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: float
    overall_risk_score: int
    risk_level: str
    confidence: float
    voice_clone_score: float
    speaker_match_score: float
    face_authenticity_score: float
    face_match_score: float
    lip_sync_score: float
    replay_score: float
    scam_intent_score: float
    challenge_status: str
    active_challenge_phrase: Optional[str] = None
    recommended_action: str
    explanation_reasons: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class CallStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
