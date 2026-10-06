from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class RiskUpdate(BaseModel):
    call_id: str
    timestamp: float
    overall_risk_score: int
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
    
    # Sub-scores (0-100 scale for UI)
    voice_authenticity: float
    voice_clone_probability: float
    speaker_match_score: float
    face_authenticity: float
    lip_sync_score: float
    replay_probability: float
    scam_intent_score: float
    
    # Explainable AI factors
    explanations: List[str]
    graduated_alert_level: str
    alert_message: Optional[str] = None
    recommended_action: str

class FraudAlertEvent(BaseModel):
    call_id: str
    timestamp: float
    severity: str
    title: str
    description: str
    evidence: Dict[str, Any] = {}
