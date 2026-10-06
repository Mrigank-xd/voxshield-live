import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "VOXSHIELD LIVE"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./voxshield.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "voxshield-hackathon-secure-secret-key-2026")
    
    # Risk Engine Configuration & Thresholds (0-29: LOW, 30-59: MEDIUM, 60-79: HIGH, 80-100: CRITICAL)
    RISK_THRESHOLD_LOW: int = 29
    RISK_THRESHOLD_MEDIUM: int = 30
    RISK_THRESHOLD_HIGH: int = 60
    RISK_THRESHOLD_CRITICAL: int = 80
    
    # Adaptive Challenge Threshold
    CHALLENGE_AUTO_TRIGGER_RISK: int = 65
    
    # Audio Processing
    AUDIO_SAMPLE_RATE: int = 16000
    AUDIO_WINDOW_SECONDS: float = 3.0
    EPHEMERAL_BUFFER_SECONDS: float = 10.0
    
    # Privacy Settings
    PRIVACY_MODE_DEFAULT: bool = False
    RETAIN_RAW_AUDIO_HOURS: int = 0  # 0 = ephemeral, discard immediately after feature extraction
    DATA_RETENTION_DAYS: int = 30
    
    # Signal Weights (Sum to 1.0)
    WEIGHT_VOICE_CLONE: float = 0.25
    WEIGHT_SCAM_INTENT: float = 0.25
    WEIGHT_SPEAKER_MATCH: float = 0.15
    WEIGHT_LIP_SYNC: float = 0.15
    WEIGHT_FACE_AUTH: float = 0.10
    WEIGHT_REPLAY: float = 0.10
    
    # WebRTC STUN/TURN
    STUN_SERVER: str = "stun:stun.l.google.com:19302"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
