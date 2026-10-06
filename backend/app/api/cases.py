from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.case import Case
from app.models.call import Call
from app.models.audit_log import AuditLog
from app.schemas.case import CaseResponse, CaseUpdate

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("/", response_model=List[CaseResponse])
def list_cases(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Case)
    if status:
        query = query.filter(Case.status == status)
    return query.order_by(Case.created_at.desc()).all()

@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter((Case.id == case_id) | (Case.case_number == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(case_id: str, payload: CaseUpdate, db: Session = Depends(get_db)):
    case = db.query(Case).filter((Case.id == case_id) | (Case.case_number == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if payload.status:
        case.status = payload.status
    if payload.investigator_notes is not None:
        case.investigator_notes = payload.investigator_notes
    if payload.recommended_action:
        case.recommended_action = payload.recommended_action
    
    case.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(case)
    return case

@router.delete("/{case_id}/purge")
def purge_case_data(case_id: str, db: Session = Depends(get_db)):
    """
    Privacy preservation & GDPR Right-to-be-Forgotten deletion endpoint.
    Permanently erases case records, call metadata, and logs an immutable audit event.
    """
    case = db.query(Case).filter((Case.id == case_id) | (Case.case_number == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    call_id = case.call_id
    call = db.query(Call).filter(Call.id == call_id).first()

    db.delete(case)
    if call:
        db.delete(call)

    db.add(AuditLog(
        action="DATA_PURGE_REQUEST",
        details=f"Permanent erasure executed for case {case_id} (Call {call_id}) under GDPR privacy retention policy."
    ))
    db.commit()

    return {"status": "success", "message": f"Case {case_id} and associated telemetry permanently erased."}
