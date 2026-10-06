from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class VoiceSignalPayload(BaseModel):
    synthetic_probability: float
    natural_probability: float
    confidence: float
    timestamp: float
    audio_quality: float = 0.9
    spectral_flatness: float = 0.0
    pitch_mean: float = 0.0
    jitter: float = 0.0
    shimmer: float = 0.0
    formant_dispersion: float = 0.0
    model_version: str = "VoxShield-AudioForensic-v2.4"

class FaceSignalPayload(BaseModel):
    timestamp: float
    face_presence: bool = True
    face_authenticity_score: float = 0.95
    face_match_score: float = 0.92
    lip_sync_score: float = 0.94
    mouth_aspect_ratio: float = 0.3
    av_offset_ms: float = 0.0
    emotion_detected: str = "Neutral"
    emotion_confidence: float = 0.8
    confidence: float = 0.9

class ConversationSignalPayload(BaseModel):
    timestamp: float
    speaker_role: str = "caller"
    text: str
    scam_intent_score: float = 0.0
    detected_categories: List[str] = []
    highlighted_phrases: List[Dict[str, Any]] = []

class AudioForensicsData(BaseModel):
    timestamp: float
    duration_s: float
    waveform_sample: List[float]
    mel_spectrogram: List[List[float]]
    mfcc_features: List[float]
    pitch_contour: List[float]
    energy_envelope: List[float]
    spectral_centroid: float
    spectral_rolloff: float
    zero_crossing_rate: float
    formants: Dict[str, float]
    anomalies: List[str]
