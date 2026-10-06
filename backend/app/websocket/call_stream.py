import json
import asyncio
import time
import base64
import numpy as np
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Any, List

from app.database import SessionLocal
from app.models.call import Call
from app.models.voice_signal import VoiceSignal
from app.models.face_signal import FaceSignal
from app.models.conversation_signal import ConversationSignal
from app.models.fraud_event import FraudEvent
from app.services.audio_processor import AudioProcessor
from app.services.voice_clone_detector import VoiceCloneDetector
from app.services.speaker_verification import SpeakerVerificationService
from app.services.replay_detector import ReplayDetector
from app.services.audio_forensics import AudioForensicsService
from app.services.scam_intent import ScamIntentDetector
from app.services.face_verification import FaceVerificationService
from app.services.lip_sync_detector import LipSyncDetector
from app.services.emotion_analysis import EmotionAnalysisService
from app.services.challenge_response import DynamicChallengeService
from app.services.risk_engine import MultiLayerRiskEngine
from app.services.evidence_service import EvidenceService

class CallStreamManager:
    """
    Manages real-time bidirectional WebSocket sessions for live calls.
    Orchestrates continuous streaming inference across audio, video,
    semantic, and risk engines.
    """
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.audio_processor = AudioProcessor()
        self.clone_detector = VoiceCloneDetector()
        self.speaker_service = SpeakerVerificationService()
        self.replay_detector = ReplayDetector()
        self.forensics_service = AudioForensicsService()
        self.scam_detector = ScamIntentDetector()
        self.face_service = FaceVerificationService()
        self.lip_sync_detector = LipSyncDetector()
        self.emotion_service = EmotionAnalysisService()
        self.challenge_service = DynamicChallengeService()
        self.risk_engine = MultiLayerRiskEngine()
        self.evidence_service = EvidenceService()
        
        # In-memory session state
        self.session_states: Dict[str, Dict[str, Any]] = {}

    async def connect(self, call_id: str, websocket: WebSocket):
        await websocket.accept()
        if call_id not in self.active_connections:
            self.active_connections[call_id] = []
            self.session_states[call_id] = {
                "start_time": time.time(),
                "previous_risk": 12,
                "accumulated_scam_categories": set(),
                "trusted_speaker_embedding": None,
                "active_challenge": None,
                "video_enabled": False,
                "history_timeline": []
            }
        self.active_connections[call_id].append(websocket)

    def disconnect(self, call_id: str, websocket: WebSocket):
        if call_id in self.active_connections:
            if websocket in self.active_connections[call_id]:
                self.active_connections[call_id].remove(websocket)
            if not self.active_connections[call_id]:
                del self.active_connections[call_id]
                self.session_states.pop(call_id, None)

    async def broadcast_to_call(self, call_id: str, message: Dict[str, Any]):
        if call_id in self.active_connections:
            raw_json = json.dumps(message)
            for conn in self.active_connections[call_id]:
                try:
                    await conn.send_text(raw_json)
                except Exception:
                    pass

    async def handle_stream(self, call_id: str, websocket: WebSocket):
        session = self.session_states.get(call_id, {})
        
        try:
            while True:
                data_text = await websocket.receive_text()
                try:
                    msg = json.loads(data_text)
                except Exception:
                    continue

                msg_type = msg.get("type", "")
                timestamp = msg.get("timestamp", time.time() - session.get("start_time", time.time()))

                # 1. PROCESS AUDIO CHUNK
                if msg_type == "audio_chunk":
                    b64_audio = msg.get("data", "")
                    audio_data = self.audio_processor.decode_base64_audio(b64_audio)
                    
                    # Voice clone analysis
                    clone_res = self.clone_detector.analyze_window(audio_data, timestamp)
                    # Replay detection
                    replay_res = self.replay_detector.analyze_replay(audio_data, timestamp)
                    # Forensics packet
                    forensics_res = self.forensics_service.extract_forensic_packet(audio_data, timestamp)
                    # Speaker verification
                    trusted_emb = session.get("trusted_speaker_embedding")
                    speaker_res = self.speaker_service.verify_speaker(audio_data, trusted_emb)

                    # Update Risk Engine
                    risk_update = self.risk_engine.calculate_call_risk(
                        voice_clone_score=clone_res["synthetic_probability"],
                        speaker_match_score=speaker_res["speaker_match_score"],
                        face_authenticity_score=session.get("last_face_auth", 1.0),
                        face_match_score=session.get("last_face_match", 1.0),
                        lip_sync_score=session.get("last_lip_sync", 1.0),
                        replay_score=replay_res["replay_probability"],
                        scam_intent_score=session.get("last_scam_score", 0.0),
                        detected_scam_categories=list(session.get("accumulated_scam_categories", [])),
                        previous_risk_score=session.get("previous_risk", 12),
                        challenge_status=session.get("challenge_status", "NOT_TRIGGERED")
                    )
                    session["previous_risk"] = risk_update["overall_risk_score"]

                    # Persist ephemeral evidence anchor
                    if risk_update["overall_risk_score"] >= 60:
                        self.evidence_service.record_forensic_evidence_anchor(
                            call_id=call_id,
                            timestamp=timestamp,
                            event_type="HIGH_RISK_VOICE_WINDOW",
                            risk_score=risk_update["overall_risk_score"],
                            feature_summary=clone_res
                        )

                    # Broadcast telemetry
                    await self.broadcast_to_call(call_id, {
                        "type": "telemetry_update",
                        "timestamp": timestamp,
                        "risk": risk_update,
                        "voice_clone": clone_res,
                        "speaker_verification": speaker_res,
                        "replay_detection": replay_res,
                        "forensics": forensics_res
                    })

                # 2. PROCESS VIDEO FRAME
                elif msg_type == "video_frame":
                    session["video_enabled"] = True
                    # In high performance mode, visual landmarks and face authenticity
                    face_auth = msg.get("face_authenticity", 0.94)
                    face_match = msg.get("face_match", 0.91)
                    lip_sync = msg.get("lip_sync", 0.88)
                    emotion = msg.get("emotion", "Neutral")

                    session["last_face_auth"] = face_auth
                    session["last_face_match"] = face_match
                    session["last_lip_sync"] = lip_sync

                    # Broadcast video update
                    await self.broadcast_to_call(call_id, {
                        "type": "video_analysis_update",
                        "timestamp": timestamp,
                        "face_authenticity_score": face_auth,
                        "face_match_score": face_match,
                        "lip_sync_score": lip_sync,
                        "emotion_detected": emotion
                    })

                # 3. PROCESS TRANSCRIPT UTTERANCE
                elif msg_type == "transcript_utterance":
                    text = msg.get("text", "")
                    speaker_role = msg.get("speaker_role", "caller")
                    scam_res = self.scam_detector.analyze_text(text)
                    
                    if scam_res["detected_categories"]:
                        session["accumulated_scam_categories"].update(scam_res["detected_categories"])
                    session["last_scam_score"] = max(session.get("last_scam_score", 0.0), scam_res["scam_intent_score"])

                    # Recompute risk with new conversational intent
                    risk_update = self.risk_engine.calculate_call_risk(
                        voice_clone_score=session.get("last_clone_score", 0.10),
                        speaker_match_score=session.get("last_speaker_match", 0.90),
                        face_authenticity_score=session.get("last_face_auth", 1.0),
                        face_match_score=session.get("last_face_match", 1.0),
                        lip_sync_score=session.get("last_lip_sync", 1.0),
                        replay_score=session.get("last_replay_score", 0.05),
                        scam_intent_score=session["last_scam_score"],
                        detected_scam_categories=list(session["accumulated_scam_categories"]),
                        previous_risk_score=session.get("previous_risk", 12),
                        challenge_status=session.get("challenge_status", "NOT_TRIGGERED"),
                        context_urgency=("URGENCY_COERCION" in session["accumulated_scam_categories"])
                    )
                    session["previous_risk"] = risk_update["overall_risk_score"]

                    # Auto-trigger dynamic challenge if risk exceeds threshold
                    if risk_update["overall_risk_score"] >= 65 and session.get("challenge_status") not in ["PENDING", "VERIFIED", "FAILED"]:
                        challenge = self.challenge_service.generate_random_challenge()
                        session["active_challenge"] = challenge
                        session["challenge_status"] = "PENDING"
                        await self.broadcast_to_call(call_id, {
                            "type": "challenge_triggered",
                            "challenge": challenge,
                            "reason": "Adaptive risk threshold exceeded (Score > 65)"
                        })

                    # Check for fraud alert event
                    if risk_update["overall_risk_score"] >= 60:
                        alert_event = {
                            "type": "fraud_alert",
                            "timestamp": timestamp,
                            "severity": risk_update["risk_level"],
                            "title": f"⚠ {risk_update['risk_level']} RISK DETECTED",
                            "description": risk_update["alert_message"] or "Elevated fraud indicators observed.",
                            "recommended_action": risk_update["recommended_action"],
                            "explanations": risk_update["explanations"]
                        }
                        await self.broadcast_to_call(call_id, alert_event)

                    # Broadcast transcript update
                    await self.broadcast_to_call(call_id, {
                        "type": "transcript_update",
                        "timestamp": timestamp,
                        "speaker_role": speaker_role,
                        "text": text,
                        "scam_intent": scam_res,
                        "risk": risk_update
                    })

                # 4. PROCESS DYNAMIC CHALLENGE RESPONSE
                elif msg_type == "verify_challenge":
                    spoken = msg.get("spoken_text", "")
                    active_challenge = session.get("active_challenge")
                    if active_challenge:
                        eval_res = self.challenge_service.evaluate_response(
                            spoken_text=spoken,
                            expected_phrase=active_challenge["challenge_phrase"],
                            expected_keywords=active_challenge["expected_keywords"],
                            response_latency_ms=msg.get("latency_ms", 1200.0),
                            voice_synthetic_prob=session.get("last_clone_score", 0.1)
                        )
                        session["challenge_status"] = eval_res["status"]
                        await self.broadcast_to_call(call_id, {
                            "type": "challenge_result",
                            "result": eval_res
                        })

                # 5. SIMULATE DEMO SCENARIO (Hackathon interactive testbed)
                elif msg_type == "simulate_scenario":
                    scenario_name = msg.get("scenario", "bank_impersonator")
                    asyncio.create_task(self._run_scenario_simulation(call_id, scenario_name))

        except WebSocketDisconnect:
            self.disconnect(call_id, websocket)

    async def _run_scenario_simulation(self, call_id: str, scenario_name: str):
        """
        Runs an interactive scenario simulation stream.
        Demonstrates the real-time progression:
        00:15 -> Low (12)
        00:38 -> Anomaly (28)
        01:04 -> Urgency (47)
        01:29 -> OTP Request (74)
        01:51 -> Synthetic voice surge (88)
        02:13 -> Critical Intervention (94)
        """
        scenarios = {
            "bank_impersonator": [
                {
                    "delay": 1.5,
                    "timestamp": 12.0,
                    "text": "Hello, this is officer Vikram Sharma from the HDFC Bank Central Security Division.",
                    "clone_prob": 0.15,
                    "speaker_match": 0.88,
                    "face_auth": 0.95,
                    "lip_sync": 0.92,
                    "replay": 0.08,
                    "event": None
                },
                {
                    "delay": 3.0,
                    "timestamp": 35.0,
                    "text": "We have detected an unauthorized wire transaction attempt of ₹85,000 on your debit card.",
                    "clone_prob": 0.38,
                    "speaker_match": 0.72,
                    "face_auth": 0.90,
                    "lip_sync": 0.82,
                    "replay": 0.15,
                    "event": {
                        "type": "URGENCY_WARNING",
                        "severity": "MEDIUM",
                        "title": "Acoustic Deviation Detected",
                        "desc": "Sub-biological micro-jitter detected in speaker cadence"
                    }
                },
                {
                    "delay": 3.5,
                    "timestamp": 68.0,
                    "text": "Your account will be permanently blocked within 10 minutes unless we verify your identity right now.",
                    "clone_prob": 0.74,
                    "speaker_match": 0.45,
                    "face_auth": 0.78,
                    "lip_sync": 0.55,
                    "replay": 0.22,
                    "event": {
                        "type": "URGENCY_COERCION",
                        "severity": "HIGH",
                        "title": "Urgency & Account Suspension Threat",
                        "desc": "Caller claims immediate account freeze to force rapid compliance"
                    }
                },
                {
                    "delay": 4.0,
                    "timestamp": 110.0,
                    "text": "I am sending a 6-digit verification code to your registered mobile. Read out the OTP immediately.",
                    "clone_prob": 0.89,
                    "speaker_match": 0.28,
                    "face_auth": 0.71,
                    "lip_sync": 0.32,
                    "replay": 0.35,
                    "event": {
                        "type": "OTP_SOLICITATION",
                        "severity": "CRITICAL",
                        "title": "Critical OTP Solicitation Attempt",
                        "desc": "Caller soliciting 6-digit one-time password over live voice"
                    }
                },
                {
                    "delay": 4.0,
                    "timestamp": 145.0,
                    "text": "Do not disconnect or tell anyone at the local branch. Transfer the funds to the secure escrow account.",
                    "clone_prob": 0.94,
                    "speaker_match": 0.21,
                    "face_auth": 0.65,
                    "lip_sync": 0.22,
                    "replay": 0.42,
                    "event": {
                        "type": "FINANCIAL_WIRE_FRAUD",
                        "severity": "CRITICAL",
                        "title": "Money Transfer & Victim Isolation",
                        "desc": "Solicitation of funds with secrecy coercion detected"
                    }
                }
            ],
            "deepfake_ceo": [
                {
                    "delay": 1.5,
                    "timestamp": 10.0,
                    "text": "Hi team, I'm currently boarding a flight to London, but this acquisition wire can't wait.",
                    "clone_prob": 0.65,
                    "speaker_match": 0.35,
                    "face_auth": 0.82,
                    "lip_sync": 0.60,
                    "replay": 0.12,
                    "event": {
                        "type": "SPEAKER_MISMATCH",
                        "severity": "HIGH",
                        "title": "Executive Voice Discrepancy",
                        "desc": "Cosine similarity mismatch against registered CEO voice embedding"
                    }
                },
                {
                    "delay": 3.5,
                    "timestamp": 45.0,
                    "text": "Wire $250,000 to the overseas vendor account immediately before 5 PM closing.",
                    "clone_prob": 0.91,
                    "speaker_match": 0.22,
                    "face_auth": 0.70,
                    "lip_sync": 0.25,
                    "replay": 0.28,
                    "event": {
                        "type": "DEEPFAKE_WIRE_SCAM",
                        "severity": "CRITICAL",
                        "title": "CEO Impersonation Wire Fraud",
                        "desc": "High synthetic probability + Urgent multi-thousand dollar wire request"
                    }
                }
            ],
            "legitimate_call": [
                {
                    "delay": 1.5,
                    "timestamp": 10.0,
                    "text": "Hi, just checking in to see if we're still on for dinner tonight at 7.",
                    "clone_prob": 0.04,
                    "speaker_match": 0.94,
                    "face_auth": 0.98,
                    "lip_sync": 0.96,
                    "replay": 0.03,
                    "event": None
                },
                {
                    "delay": 3.0,
                    "timestamp": 35.0,
                    "text": "Let me know whenever you're free, talk soon!",
                    "clone_prob": 0.05,
                    "speaker_match": 0.96,
                    "face_auth": 0.97,
                    "lip_sync": 0.95,
                    "replay": 0.02,
                    "event": None
                }
            ]
        }

        steps = scenarios.get(scenario_name, scenarios["bank_impersonator"])
        session = self.session_states.get(call_id, {})

        for step in steps:
            await asyncio.sleep(step["delay"])
            ts = step["timestamp"]

            # Analyze scam intent
            scam_res = self.scam_detector.analyze_text(step["text"])
            if scam_res["detected_categories"]:
                session.setdefault("accumulated_scam_categories", set()).update(scam_res["detected_categories"])

            # Compute risk
            risk_update = self.risk_engine.calculate_call_risk(
                voice_clone_score=step["clone_prob"],
                speaker_match_score=step["speaker_match"],
                face_authenticity_score=step["face_auth"],
                face_match_score=step["face_auth"],
                lip_sync_score=step["lip_sync"],
                replay_score=step["replay"],
                scam_intent_score=scam_res["scam_intent_score"],
                detected_scam_categories=list(session.get("accumulated_scam_categories", [])),
                previous_risk_score=session.get("previous_risk", 12),
                challenge_status=session.get("challenge_status", "NOT_TRIGGERED"),
                context_urgency=("URGENCY_COERCION" in session.get("accumulated_scam_categories", []))
            )
            session["previous_risk"] = risk_update["overall_risk_score"]

            # Generate synthetic forensics packet for visual chart
            dummy_audio = np.random.randn(16000 * 2).astype(np.float32) * (0.05 if step["clone_prob"] < 0.5 else 0.15)
            forensics_pkt = self.forensics_service.extract_forensic_packet(dummy_audio, ts)

            # Auto trigger challenge if high risk
            if risk_update["overall_risk_score"] >= 65 and session.get("challenge_status") not in ["PENDING", "VERIFIED", "FAILED"]:
                challenge = self.challenge_service.generate_random_challenge()
                session["active_challenge"] = challenge
                session["challenge_status"] = "PENDING"
                await self.broadcast_to_call(call_id, {
                    "type": "challenge_triggered",
                    "challenge": challenge,
                    "reason": "Adaptive risk threshold exceeded (Score > 65)"
                })

            # Save event to DB
            if step["event"]:
                try:
                    db = SessionLocal()
                    db_event = FraudEvent(
                        call_id=call_id,
                        timestamp_offset=ts,
                        event_type=step["event"]["type"],
                        severity=step["event"]["severity"],
                        title=step["event"]["title"],
                        description=step["event"]["desc"],
                        evidence_data={"risk_score": risk_update["overall_risk_score"]}
                    )
                    db.add(db_event)
                    # Update call record
                    call_rec = db.query(Call).filter(Call.id == call_id).first()
                    if call_rec:
                        call_rec.overall_risk_score = risk_update["overall_risk_score"]
                        call_rec.risk_level = risk_update["risk_level"]
                        call_rec.voice_clone_score = step["clone_prob"]
                        call_rec.speaker_match_score = step["speaker_match"]
                        call_rec.face_authenticity_score = step["face_auth"]
                        call_rec.lip_sync_score = step["lip_sync"]
                        call_rec.replay_score = step["replay"]
                        call_rec.scam_intent_score = scam_res["scam_intent_score"]
                        call_rec.recommended_action = risk_update["recommended_action"]
                        call_rec.explanation_reasons = risk_update["explanations"]
                    db.commit()
                    db.close()
                except Exception:
                    pass

            # Broadcast comprehensive real-time update
            await self.broadcast_to_call(call_id, {
                "type": "simulation_tick",
                "timestamp": ts,
                "text": step["text"],
                "speaker_role": "caller",
                "scam_intent": scam_res,
                "risk": risk_update,
                "voice_clone": {
                    "synthetic_probability": step["clone_prob"],
                    "natural_probability": round(1.0 - step["clone_prob"], 2),
                    "confidence": 0.92,
                    "timestamp": ts,
                    "audio_quality": 0.88,
                    "anomalies": ["Sub-biological jitter anomaly"] if step["clone_prob"] > 0.6 else []
                },
                "speaker_verification": {
                    "speaker_match_score": step["speaker_match"],
                    "verification_status": "VERIFIED" if step["speaker_match"] > 0.8 else "MISMATCH",
                    "message": f"Speaker match: {int(step['speaker_match'] * 100)}%"
                },
                "video_analysis": {
                    "face_authenticity_score": step["face_auth"],
                    "face_match_score": step["face_auth"],
                    "lip_sync_score": step["lip_sync"],
                    "emotion_detected": "Tense / Coercive" if step["clone_prob"] > 0.6 else "Neutral"
                },
                "replay_detection": {
                    "replay_probability": step["replay"],
                    "confidence": 0.85
                },
                "forensics": forensics_pkt,
                "event": step["event"]
            })

stream_manager = CallStreamManager()
