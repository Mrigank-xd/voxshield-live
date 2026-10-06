from sqlalchemy import Column, Integer, Float, String, Text, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class FraudEvent(Base):
    __tablename__ = "fraud_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=False, index=True)
    timestamp_offset = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Event classifications
    event_type = Column(String(50), nullable=False) # e.g. "VOICE_ANOMALY", "SYNTHETIC_SPEECH", "OTP_REQUEST", "FINANCIAL_URGENCY", "LIP_SYNC_MISMATCH", "SPEAKER_MISMATCH", "REPLAY_DETECTED", "CRITICAL_RISK"
    severity = Column(String(20), nullable=False)   # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    evidence_data = Column(JSON, default=dict)
    resolved = Column(Boolean, default=False)

    call = relationship("Call", back_populates="fraud_events")
