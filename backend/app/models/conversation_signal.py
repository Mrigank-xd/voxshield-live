from sqlalchemy import Column, Integer, Float, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class ConversationSignal(Base):
    __tablename__ = "conversation_signals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=False, index=True)
    timestamp_offset = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    speaker_role = Column(String(20), default="caller") # "caller", "user", "agent"
    text = Column(Text, nullable=False)
    
    # Scam intent analytics
    scam_intent_score = Column(Float, default=0.0) # 0.0 - 100.0
    risk_level = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    detected_categories = Column(JSON, default=list) # e.g. ["OTP_REQUEST", "URGENCY", "BANK_IMPERSONATION"]
    highlighted_phrases = Column(JSON, default=list) # e.g. [{"phrase": "transfer ₹85,000 immediately", "category": "FINANCIAL"}]
    confidence = Column(Float, default=0.9)

    call = relationship("Call", back_populates="conversation_signals")
