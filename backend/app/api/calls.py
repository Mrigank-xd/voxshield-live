from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.database import get_db
from app.models.call import Call
from app.models.case import Case
from app.models.fraud_event import FraudEvent
from app.models.audit_log import AuditLog
from app.schemas.call import CallCreate, CallResponse, CallStatusUpdate

router = APIRouter(prefix="/calls", tags=["Calls"])

@router.post("/", response_model=CallResponse)
def create_call(payload: CallCreate, db: Session = Depends(get_db)):
    call_id = str(uuid.uuid4())
    session_token = str(uuid.uuid4())

    new_call = Call(
        id=call_id,
        session_token=session_token,
        caller_name=payload.caller_name or "Unknown Caller",
        caller_number=payload.caller_number or "+1 (555) 019-2831",
        call_type=payload.call_type or "audio",
        provider=payload.provider or "webrtc",
        consent_given=payload.consent_given,
        privacy_mode=payload.privacy_mode,
        status="active",
        overall_risk_score=12,
        risk_level="LOW",
        voice_clone_score=0.08,
        speaker_match_score=0.94,
        face_authenticity_score=0.96 if payload.call_type == "video" else 1.0,
        face_match_score=0.93 if payload.call_type == "video" else 1.0,
        lip_sync_score=0.92 if payload.call_type == "video" else 1.0,
        replay_score=0.05,
        scam_intent_score=0.0,
        recommended_action="Silent monitoring. No immediate threats detected.",
        explanation_reasons=["+ Vocal dynamics and conversation flow match natural human baseline"]
    )
    db.add(new_call)

    # Automatically create associated investigation Case
    case_number = f"VX-{datetime.utcnow().year}-{str(uuid.uuid4())[:8].upper()}"
    new_case = Case(
        case_number=case_number,
        call_id=call_id,
        status="OPEN",
        risk_score=12,
        risk_level="LOW",
        investigator_notes="Live call session initialized. Continuous multimodal monitoring active."
    )
    db.add(new_case)

    # Log audit entry
    audit = AuditLog(
        action="CALL_INITIALIZED",
        details=f"Call {call_id} initiated ({payload.call_type}) with provider={payload.provider}. Privacy mode={payload.privacy_mode}."
    )
    db.add(audit)

    db.commit()
    db.refresh(new_call)
    return new_call

@router.get("/", response_model=List[CallResponse])
def list_calls(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Call)
    if status:
        query = query.filter(Call.status == status)
    return query.order_by(Call.created_at.desc()).all()

@router.get("/{call_id}", response_model=CallResponse)
def get_call(call_id: str, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call session not found")
    return call

@router.post("/{call_id}/end", response_model=CallResponse)
def end_call(call_id: str, db: Session = Depends(get_db)):
    call = db.query(Call).filter(Call.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call session not found")

    call.status = "completed"
    call.ended_at = datetime.utcnow()
    if call.created_at:
        call.duration_seconds = max(1.0, (call.ended_at - call.created_at).total_seconds())

    # Update associated case
    if call.case:
        call.case.risk_score = call.overall_risk_score
        call.case.risk_level = call.risk_level
        if call.overall_risk_score >= 60:
            call.case.status = "INVESTIGATING"

    # Log audit
    audit = AuditLog(
        action="CALL_TERMINATED",
        details=f"Call {call_id} terminated with final risk {call.overall_risk_score}/100 ({call.risk_level})."
    )
    db.add(audit)

    db.commit()
    db.refresh(call)
    return call

@router.get("/{call_id}/events")
def get_call_events(call_id: str, db: Session = Depends(get_db)):
    events = db.query(FraudEvent).filter(FraudEvent.call_id == call_id).order_by(FraudEvent.timestamp_offset.asc()).all()
    return [
        {
            "id": ev.id,
            "timestamp": ev.timestamp_offset,
            "event_type": ev.event_type,
            "severity": ev.severity,
            "title": ev.title,
            "description": ev.description,
            "evidence": ev.evidence_data
        }
        for ev in events
    ]
