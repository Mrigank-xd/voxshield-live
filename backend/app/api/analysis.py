from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import numpy as np

from app.services.audio_processor import AudioProcessor
from app.services.voice_clone_detector import VoiceCloneDetector
from app.services.replay_detector import ReplayDetector
from app.services.audio_forensics import AudioForensicsService
from app.services.scam_intent import ScamIntentDetector

router = APIRouter(prefix="/analysis", tags=["Analysis"])

audio_processor = AudioProcessor()
clone_detector = VoiceCloneDetector()
replay_detector = ReplayDetector()
forensics_service = AudioForensicsService()
scam_detector = ScamIntentDetector()

class AudioAnalysisRequest(BaseModel):
    audio_base64: str
    timestamp: float = 0.0

class TextAnalysisRequest(BaseModel):
    text: str
    timestamp: float = 0.0

@router.post("/audio-window")
def analyze_audio_window(payload: AudioAnalysisRequest):
    """
    Real-Time Voice Clone & Acoustic Analysis of a 3-10s audio window.
    """
    audio_data = audio_processor.decode_base64_audio(payload.audio_base64)
    clone_result = clone_detector.analyze_window(audio_data, payload.timestamp)
    replay_result = replay_detector.analyze_replay(audio_data, payload.timestamp)

    return {
        "clone_detection": clone_result,
        "replay_detection": replay_result
    }

@router.post("/audio-forensics")
def get_forensic_breakdown(payload: AudioAnalysisRequest):
    """
    Extracts deep AI Audio Forensics: Waveform, Mel-Spectrogram, MFCC, Pitch Contour, Formants.
    """
    audio_data = audio_processor.decode_base64_audio(payload.audio_base64)
    forensic_packet = forensics_service.extract_forensic_packet(audio_data, payload.timestamp)
    return forensic_packet

@router.post("/scam-intent")
def analyze_scam_intent(payload: TextAnalysisRequest):
    """
    Evaluates transcript text for financial urgency, OTP requests, and impersonation.
    """
    result = scam_detector.analyze_text(payload.text)
    return result
