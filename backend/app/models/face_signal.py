from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class FaceSignal(Base):
    __tablename__ = "face_signals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=False, index=True)
    timestamp_offset = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    face_presence = Column(Boolean, default=True)
    face_authenticity_score = Column(Float, default=1.0) # 0.0 - 1.0 (1 = authentic)
    face_match_score = Column(Float, default=1.0)        # against reference identity
    confidence = Column(Float, default=0.9)

    # Facial landmark & motion dynamics
    landmark_count = Column(Integer, default=68)
    head_pose_yaw = Column(Float, default=0.0)
    head_pose_pitch = Column(Float, default=0.0)
    head_pose_roll = Column(Float, default=0.0)
    blink_rate = Column(Float, default=0.25)
    micro_expression_variance = Column(Float, default=0.5)

    # Lip-Sync metrics
    lip_sync_score = Column(Float, default=1.0)
    mouth_aspect_ratio = Column(Float, default=0.3)
    av_offset_ms = Column(Float, default=0.0)

    # Emotion
    emotion_detected = Column(String(50), default="Neutral")
    emotion_confidence = Column(Float, default=0.8)
    emotion_voice_consistency = Column(Float, default=0.9) # 0.0 = completely contradictory

    call = relationship("Call", back_populates="face_signals")
