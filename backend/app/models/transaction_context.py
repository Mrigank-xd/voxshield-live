from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class TransactionContext(Base):
    __tablename__ = "transaction_contexts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    call_id = Column(String(36), ForeignKey("calls.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    claimed_organization = Column(String(100), default="None")
    claimed_agent_name = Column(String(100), default="Unknown")
    requested_amount = Column(Float, default=0.0)
    requested_action = Column(String(100), default="None") # e.g., "Wire Transfer", "Share OTP", "Install QuickSupport"
    urgency_flag = Column(Boolean, default=False)
    threat_flag = Column(Boolean, default=False)
    secrecy_flag = Column(Boolean, default=False)
    context_risk_score = Column(Float, default=0.0) # 0.0 - 100.0

    call = relationship("Call", back_populates="transaction_contexts")
