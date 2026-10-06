from pydantic import BaseModel
from typing import Optional

class ChallengeRequest(BaseModel):
    call_id: str
    custom_phrase: Optional[str] = None

class ChallengeVerification(BaseModel):
    call_id: str
    challenge_phrase: str
    spoken_phrase: str
    audio_base64: Optional[str] = None
    response_latency_ms: Optional[float] = 1200.0

class ChallengeResponseResult(BaseModel):
    challenge_phrase: str
    spoken_phrase: str
    matched: bool
    status: str # "VERIFIED", "FAILED", "SUSPICIOUS"
    voice_authenticity_score: float
    confidence: float
    message: str
