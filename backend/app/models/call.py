import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Call(Base):
    __tablename__ = "calls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_token = Column(String(64), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    caller_name = Column(String(100), default="Unknown Caller")
    caller_number = Column(String(50), default="+1 (555) 019-2831")
    call_type = Column(String(20), default="audio")  # "audio" or "video"
    status = Column(String(20), default="active")    # "active", "completed", "terminated"
    provider = Column(String(20), default="webrtc")  # "webrtc", "mock", "sip"
    consent_given = Column(Boolean, default=True)
    privacy_mode = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Float, default=0.0)
    
    # Real-time and cumulative risk states
    overall_risk_score = Column(Integer, default=10) # 0 - 100
    risk_level = Column(String(20), default="LOW")   # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=0.85)
    
    # Component signal aggregates
    voice_clone_score = Column(Float, default=0.0)
    speaker_match_score = Column(Float, default=1.0)
    face_authenticity_score = Column(Float, default=1.0)
    face_match_score = Column(Float, default=1.0)
    lip_sync_score = Column(Float, default=1.0)
    replay_score = Column(Float, default=0.0)
    scam_intent_score = Column(Float, default=0.0)
    
    # Challenge Status: NOT_TRIGGERED, PENDING, VERIFIED, FAILED
    challenge_status = Column(String(20), default="NOT_TRIGGERED")
    active_challenge_phrase = Column(String(100), nullable=True)
    
    # Explainable AI & Recommendations
    recommended_action = Column(String(255), default="Silent monitoring. No immediate threats detected.")
    explanation_reasons = Column(JSON, default=list) # List of explanations: e.g. ["+ Synthetic pitch variance anomaly"]
    
    # Relationships
    voice_signals = relationship("VoiceSignal", back_populates="call", cascade="all, delete-orphan")
    face_signals = relationship("FaceSignal", back_populates="call", cascade="all, delete-orphan")
    conversation_signals = relationship("ConversationSignal", back_populates="call", cascade="all, delete-orphan")
    fraud_events = relationship("FraudEvent", back_populates="call", cascade="all, delete-orphan")
    transaction_contexts = relationship("TransactionContext", back_populates="call", cascade="all, delete-orphan")
    case = relationship("Case", back_populates="call", uselist=False, cascade="all, delete-orphan")
