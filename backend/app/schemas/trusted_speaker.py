from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class TrustedSpeakerCreate(BaseModel):
    name: str
    role_or_relationship: str = "Authorized Executive"
    phone_number: Optional[str] = None
    sample_audio_base64: Optional[str] = None # Used only during registration to extract embedding vector, then discarded

class TrustedSpeakerResponse(BaseModel):
    id: int
    name: str
    role_or_relationship: str
    phone_number: Optional[str] = None
    voice_sample_hash: str
    registered_at: datetime
    active: bool
    notes: str

    model_config = ConfigDict(from_attributes=True)

class SpeakerVerificationCheck(BaseModel):
    speaker_id: int
    audio_base64: Optional[str] = None
    claimed_name: Optional[str] = None
