import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_number = Column(String(50), unique=True, nullable=False) # e.g. "VX-2026-9812"
    call_id = Column(String(36), ForeignKey("calls.id"), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    status = Column(String(30), default="OPEN") # "OPEN", "INVESTIGATING", "RESOLVED", "ESCALATED", "DISMISSED"
    risk_score = Column(Integer, default=50)
    risk_level = Column(String(20), default="MEDIUM")
    
    investigator_notes = Column(Text, default="")
    recommended_action = Column(String(255), default="Conduct secondary out-of-band identity verification.")
    report_generated = Column(Boolean, default=False)
    report_path = Column(String(255), nullable=True)

    call = relationship("Call", back_populates="case")
