from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class VoiceSignal(Base):
    __tablename__ = "voice_signals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=False, index=True)
    timestamp_offset = Column(Float, nullable=False) # Offset in seconds from call start
    created_at = Column(DateTime, default=datetime.utcnow)

    # Clone Detection metrics
    synthetic_probability = Column(Float, nullable=False, default=0.0)
    natural_probability = Column(Float, nullable=False, default=1.0)
    confidence = Column(Float, nullable=False, default=0.9)
    audio_quality = Column(Float, default=0.85)

    # Forensic acoustic features
    spectral_flatness = Column(Float, default=0.0)
    pitch_mean = Column(Float, default=0.0)
    pitch_std = Column(Float, default=0.0)
    jitter = Column(Float, default=0.0)
    shimmer = Column(Float, default=0.0)
    formant_dispersion = Column(Float, default=0.0)
    spectral_centroid = Column(Float, default=0.0)
    spectral_rolloff = Column(Float, default=0.0)
    zero_crossing_rate = Column(Float, default=0.0)

    # Replay metrics
    replay_probability = Column(Float, default=0.0)
    room_impulse_score = Column(Float, default=0.0)

    # Speaker match
    speaker_match_score = Column(Float, default=1.0)
    claimed_speaker = Column(String(100), nullable=True)

    model_version = Column(String(50), default="VoxShield-AudioForensic-v2.4")

    call = relationship("Call", back_populates="voice_signals")
