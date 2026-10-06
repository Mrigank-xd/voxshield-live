import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.case import Case
from app.models.call import Call
from app.models.fraud_event import FraudEvent
from app.services.report_generator import ForensicReportGenerator

router = APIRouter(prefix="/reports", tags=["Reports"])
report_generator = ForensicReportGenerator(output_dir="./reports_storage")

@router.post("/generate/{case_id}")
def generate_report(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter((Case.id == case_id) | (Case.case_number == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    call = case.call
    if not call:
        raise HTTPException(status_code=404, detail="Associated call not found")

    # Fetch recorded fraud events
    events = db.query(FraudEvent).filter(FraudEvent.call_id == call.id).order_by(FraudEvent.timestamp_offset.asc()).all()
    events_payload = [
        {
            "time": f"{int(ev.timestamp_offset // 60):02d}:{int(ev.timestamp_offset % 60):02d}",
            "type": ev.event_type,
            "desc": ev.description
        }
        for ev in events
    ]

    report_payload = {
        "case_id": case.case_number,
        "call_id": call.id,
        "caller_name": call.caller_name,
        "overall_risk_score": call.overall_risk_score,
        "risk_level": call.risk_level,
        "confidence": call.confidence,
        "duration_seconds": int(call.duration_seconds or 120),
        "voice_clone_score": call.voice_clone_score,
        "speaker_match_score": call.speaker_match_score,
        "face_authenticity_score": call.face_authenticity_score,
        "lip_sync_score": call.lip_sync_score,
        "replay_score": call.replay_score,
        "scam_intent_score": call.scam_intent_score,
        "challenge_status": call.challenge_status,
        "explanation_reasons": call.explanation_reasons or [],
        "recommended_action": call.recommended_action,
        "fraud_events": events_payload,
        "evidence_hash": f"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }

    pdf_path = report_generator.generate_pdf_report(report_payload)
    case.report_generated = True
    case.report_path = pdf_path
    db.commit()

    return {
        "status": "success",
        "case_number": case.case_number,
        "report_path": pdf_path,
        "generated_at": datetime.utcnow()
    }

@router.get("/download/{case_id}")
def download_report(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter((Case.id == case_id) | (Case.case_number == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if not case.report_generated or not case.report_path or not os.path.exists(case.report_path):
        # Auto-generate if not yet built
        generate_report(case_id, db)
        db.refresh(case)

    return FileResponse(
        case.report_path,
        media_type="application/pdf",
        filename=os.path.basename(case.report_path)
    )

@router.get("/{case_id}")
def get_report_metadata(case_id: str, db: Session = Depends(get_db)):
    case = db.query(Case).filter((Case.id == case_id) | (Case.case_number == case_id)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    return {
        "case_id": case.id,
        "case_number": case.case_number,
        "call_id": case.call_id,
        "risk_score": case.risk_score,
        "risk_level": case.risk_level,
        "status": case.status,
        "report_generated": case.report_generated,
        "report_path": case.report_path,
        "recommended_action": case.recommended_action,
        "investigator_notes": case.investigator_notes
    }
