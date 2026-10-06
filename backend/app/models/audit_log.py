from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    action = Column(String(100), nullable=False) # e.g. "DATA_DELETION", "CONSENT_GRANTED", "PRIVACY_MODE_TOGGLED", "CALL_STARTED"
    details = Column(Text, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    compliance_tag = Column(String(50), default="GDPR-EPHEMERAL")
