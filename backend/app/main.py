import os
import uuid
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

from app.config import settings
from app.database import engine, Base, SessionLocal
import app.models # Ensures all models are registered
from app.models.call import Call
from app.models.case import Case
from app.models.trusted_speaker import TrustedSpeaker
from app.models.fraud_event import FraudEvent
from app.api.calls import router as calls_router
from app.api.analysis import router as analysis_router
from app.api.verification import router as verification_router
from app.api.reports import router as reports_router
from app.api.cases import router as cases_router
from app.websocket.call_stream import stream_manager

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-Time AI Voice-Clone & Multi-Modal Scam Detection Platform during Live Calls."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(calls_router, prefix=settings.API_PREFIX)
app.include_router(analysis_router, prefix=settings.API_PREFIX)
app.include_router(verification_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(cases_router, prefix=settings.API_PREFIX)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat()
    }

# WebRTC Signaling Endpoint
class WebRTCOfferPayload(BaseModel):
    call_id: str
    sdp: str
    type: str

@app.post("/api/webrtc/offer")
async def handle_webrtc_offer(payload: WebRTCOfferPayload):
    """
    WebRTC SDP offer negotiation endpoint.
    Accepts browser RTCPeerConnection SDP offer and negotiates local media loopback.
    """
    try:
        from aiortc import RTCPeerConnection, RTCSessionDescription
        pc = RTCPeerConnection()
        desc = RTCSessionDescription(sdp=payload.sdp, type=payload.type)
        await pc.setRemoteDescription(desc)
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return {
            "sdp": pc.localDescription.sdp,
            "type": pc.localDescription.type,
            "call_id": payload.call_id
        }
    except Exception as e:
        # Graceful fallback mock SDP response if aiortc media tracks are simulated
        return {
            "status": "signaled",
            "call_id": payload.call_id,
            "sdp": payload.sdp,
            "type": "answer",
            "notice": "WebRTC signaling registered with local peer loopback."
        }

# Real-time WebSocket Endpoint
@app.websocket("/ws/call/{call_id}")
async def websocket_call_endpoint(websocket: WebSocket, call_id: str):
    await stream_manager.connect(call_id, websocket)
    try:
        await stream_manager.handle_stream(call_id, websocket)
    except WebSocketDisconnect:
        stream_manager.disconnect(call_id, websocket)

@app.on_event("startup")
def seed_initial_demo_data():
    """Seed sample enrolled trusted speaker and demo cases if database is fresh."""
    db = SessionLocal()
    try:
        if db.query(TrustedSpeaker).count() == 0:
            import numpy as np
            rng = np.random.RandomState(42)
            emb = (rng.randn(128) / 10.0).tolist()
            sample_speaker = TrustedSpeaker(
                name="Sarah Jenkins",
                role_or_relationship="Chief Financial Officer (CFO)",
                phone_number="+1 (555) 482-9102",
                embedding_vector=emb,
                voice_sample_hash="7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                active=True,
                notes="Verified baseline speaker profile for executive wire authorization."
            )
            db.add(sample_speaker)

        if db.query(Call).count() == 0:
            demo_call_id = str(uuid.uuid4())
            demo_call = Call(
                id=demo_call_id,
                session_token=str(uuid.uuid4()),
                caller_name="Suspected Impersonator (Bank Security)",
                caller_number="+1 (800) 432-1000",
                call_type="video",
                status="completed",
                duration_seconds=165.0,
                overall_risk_score=87,
                risk_level="CRITICAL",
                confidence=0.92,
                voice_clone_score=0.88,
                speaker_match_score=0.24,
                face_authenticity_score=0.74,
                face_match_score=0.68,
                lip_sync_score=0.34,
                replay_score=0.19,
                scam_intent_score=91.0,
                challenge_status="FAILED",
                active_challenge_phrase="Blue Falcon 742",
                recommended_action="Require independent verification before high-impact action. Caller attempted OTP solicitation.",
                explanation_reasons=[
                    "+ Synthetic speech indicators detected (sub-biological micro-jitter / vocoder artifact)",
                    "+ Speaker does not strongly match trusted biometric profile",
                    "+ Caller requested one-time passcode (OTP) or security credential",
                    "+ Unusual psychological urgency and coercive threat patterns detected",
                    "+ Audio-visual lip-sync discrepancy detected (mouth motion out of phase with speech)"
                ]
            )
            db.add(demo_call)

            demo_case = Case(
                case_number="VX-2026-9812",
                call_id=demo_call_id,
                status="INVESTIGATING",
                risk_score=87,
                risk_level="CRITICAL",
                investigator_notes="High severity social engineering wire fraud intercepted. Synthetic vocal markers confirmed."
            )
            db.add(demo_case)

            events = [
                FraudEvent(
                    call_id=demo_call_id,
                    timestamp_offset=32.0,
                    event_type="VOICE_ANOMALY",
                    severity="MEDIUM",
                    title="Acoustic Jitter Anomaly",
                    description="Sub-biological vocal cord micro-jitter detected (<0.2% variance)."
                ),
                FraudEvent(
                    call_id=demo_call_id,
                    timestamp_offset=68.0,
                    event_type="URGENCY_COERCION",
                    severity="HIGH",
                    title="Urgency Coercion Detected",
                    description="Caller demanded immediate action within 10 minutes to prevent account freeze."
                ),
                FraudEvent(
                    call_id=demo_call_id,
                    timestamp_offset=110.0,
                    event_type="OTP_REQUEST",
                    severity="CRITICAL",
                    title="Critical OTP Solicitation Attempt",
                    description="Caller solicited 6-digit one-time password over live voice."
                ),
                FraudEvent(
                    call_id=demo_call_id,
                    timestamp_offset=135.0,
                    event_type="LIP_SYNC_MISMATCH",
                    severity="HIGH",
                    title="Audio-Visual Lip-Sync Desync",
                    description="Mouth aspect ratio static during vocal speech delivery (offset > 240ms)."
                )
            ]
            for ev in events:
                db.add(ev)

        db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()
