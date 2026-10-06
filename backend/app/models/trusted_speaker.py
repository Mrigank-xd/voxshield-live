from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, JSON, Text
from app.database import Base

class TrustedSpeaker(Base):
    __tablename__ = "trusted_speakers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    role_or_relationship = Column(String(100), default="Authorized Executive") # e.g. "CEO", "CFO", "Family Member"
    phone_number = Column(String(50), nullable=True)
    
    # Privacy-Preserving representation: Normalized 128-d acoustic vector, NOT raw audio
    embedding_vector = Column(JSON, nullable=False) 
    voice_sample_hash = Column(String(64), nullable=False) # SHA-256 hash of registration event
    
    registered_at = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)
    notes = Column(Text, default="Enrolled via privacy-preserving acoustic filterbank embedding.")
