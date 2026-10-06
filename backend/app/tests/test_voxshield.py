import pytest
import numpy as np
from fastapi.testclient import TestClient

from app.main import app
from app.services.audio_processor import AudioProcessor
from app.services.voice_clone_detector import VoiceCloneDetector
from app.services.speaker_verification import SpeakerVerificationService
from app.services.replay_detector import ReplayDetector
from app.services.scam_intent import ScamIntentDetector
from app.services.lip_sync_detector import LipSyncDetector
from app.services.challenge_response import DynamicChallengeService
from app.services.fusion_engine import FusionEngine
from app.services.risk_engine import MultiLayerRiskEngine
from app.services.report_generator import ForensicReportGenerator

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "VOXSHIELD" in data["service"]

def test_audio_processor_and_clone_detector():
    processor = AudioProcessor(sample_rate=16000)
    # Generate 2 seconds of synthetic audio (sine wave)
    t = np.linspace(0, 2.0, 32000, endpoint=False)
    audio = (0.5 * np.sin(2 * np.pi * 220 * t)).astype(np.float32)

    detector = VoiceCloneDetector(sample_rate=16000)
    result = detector.analyze_window(audio, timestamp=1.5)
    
    assert "synthetic_probability" in result
    assert "natural_probability" in result
    assert 0.0 <= result["synthetic_probability"] <= 1.0
    assert result["synthetic_probability"] + result["natural_probability"] == pytest.approx(1.0, abs=0.01)
    assert result["confidence"] > 0.6
    assert result["model_version"] == "VoxShield-AudioForensic-v2.4-AcousticML"

def test_speaker_verification():
    service = SpeakerVerificationService(sample_rate=16000)
    audio_ref = np.random.randn(32000).astype(np.float32) * 0.1
    audio_test = audio_ref + np.random.randn(32000).astype(np.float32) * 0.01

    embedding_ref = service.extract_privacy_preserving_embedding(audio_ref)
    assert len(embedding_ref) == 128

    verify_res = service.verify_speaker(audio_test, embedding_ref, claimed_identity="Alice")
    assert verify_res["speaker_match_score"] > 0.70
    assert verify_res["claimed_identity"] == "Alice"

def test_replay_detector():
    detector = ReplayDetector(sample_rate=16000)
    audio = np.random.randn(32000).astype(np.float32) * 0.05
    res = detector.analyze_replay(audio, timestamp=2.0)
    
    assert "replay_probability" in res
    assert 0.0 <= res["replay_probability"] <= 1.0
    assert "transducer_ratio" in res

def test_scam_intent_detector():
    detector = ScamIntentDetector()
    text = "Your bank account will be blocked unless you transfer ₹85,000 immediately and share the OTP."
    res = detector.analyze_text(text)
    
    assert res["scam_intent_score"] >= 80.0
    assert res["risk_level"] == "CRITICAL"
    assert "OTP_REQUEST" in res["detected_categories"]
    assert "URGENCY_COERCION" in res["detected_categories"]
    assert "ACCOUNT_SUSPENSION_THREAT" in res["detected_categories"]
    assert len(res["highlighted_phrases"]) >= 3

def test_lip_sync_detector():
    detector = LipSyncDetector(sample_rate=16000)
    # Loud audio + static lips = severe desync
    audio_rms = np.array([0.15] * 20)
    mouth_aspect = np.array([0.02] * 20) # static mouth
    
    res = detector.analyze_synchronization(audio_rms, mouth_aspect, timestamp=3.0)
    assert res["lip_sync_score"] < 0.40
    assert res["status"] == "MISMATCH_DETECTED"

def test_dynamic_challenge_service():
    service = DynamicChallengeService()
    challenge = service.generate_random_challenge()
    assert "challenge_phrase" in challenge
    assert len(challenge["expected_keywords"]) >= 2

    # Test correct verification
    eval_ok = service.evaluate_response(
        spoken_text=challenge["challenge_phrase"],
        expected_phrase=challenge["challenge_phrase"],
        expected_keywords=challenge["expected_keywords"],
        response_latency_ms=1200.0,
        voice_synthetic_prob=0.05
    )
    assert eval_ok["status"] == "VERIFIED"

    # Test failed verification
    eval_fail = service.evaluate_response(
        spoken_text="Something completely random",
        expected_phrase=challenge["challenge_phrase"],
        expected_keywords=challenge["expected_keywords"],
        response_latency_ms=1200.0,
        voice_synthetic_prob=0.05
    )
    assert eval_fail["status"] == "FAILED"

def test_fusion_and_risk_engine():
    risk_engine = MultiLayerRiskEngine()
    risk_res = risk_engine.calculate_call_risk(
        voice_clone_score=0.88,
        speaker_match_score=0.25,
        face_authenticity_score=0.70,
        face_match_score=0.65,
        lip_sync_score=0.30,
        replay_score=0.20,
        scam_intent_score=90.0,
        detected_scam_categories=["OTP_REQUEST", "URGENCY_COERCION"],
        previous_risk_score=40
    )

    assert risk_res["overall_risk_score"] >= 60
    assert risk_res["risk_level"] in ["HIGH", "CRITICAL"]
    assert len(risk_res["explanations"]) >= 3
    assert "Synthetic speech indicators detected" in risk_res["explanations"][0]

def test_calls_api_and_report_generation():
    # 1. Create Call
    create_res = client.post("/api/calls/", json={
        "caller_name": "Test Impersonator",
        "caller_number": "+1 800 555 1234",
        "call_type": "video"
    })
    assert create_res.status_code == 200
    call_data = create_res.json()
    call_id = call_data["id"]

    # 2. Get Call
    get_res = client.get(f"/api/calls/{call_id}")
    assert get_res.status_code == 200
    assert get_res.json()["caller_name"] == "Test Impersonator"

    # 3. List Cases
    cases_res = client.get("/api/cases/")
    assert cases_res.status_code == 200
    cases = cases_res.json()
    assert len(cases) >= 1
    case_id = cases[0]["id"]

    # 4. Generate Report PDF
    rep_res = client.post(f"/api/reports/generate/{case_id}")
    assert rep_res.status_code == 200
    rep_data = rep_res.json()
    assert rep_data["status"] == "success"
    assert rep_data["report_path"].endswith(".pdf")
