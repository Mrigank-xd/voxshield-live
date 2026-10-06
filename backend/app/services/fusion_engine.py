from typing import Dict, Any, List
from app.config import settings
import numpy as np

class FusionEngine:
    """
    Multimodal Fusion Engine for Live Fraud Detection.
    Synthesizes independent acoustic, visual, semantic, and contextual signals:
    - Voice Clone synthetic probability
    - Speaker match score
    - Face authenticity & match score
    - Lip sync synchronization score
    - Acoustic replay probability
    - Scam conversational intent
    - Challenge-response outcome
    """
    def __init__(self):
        # Configurable signal weights
        self.weights = {
            "voice_clone": settings.WEIGHT_VOICE_CLONE,     # 0.25
            "scam_intent": settings.WEIGHT_SCAM_INTENT,     # 0.25
            "speaker_mismatch": settings.WEIGHT_SPEAKER_MATCH, # 0.15
            "lip_sync_mismatch": settings.WEIGHT_LIP_SYNC,     # 0.15
            "face_inauthenticity": settings.WEIGHT_FACE_AUTH,  # 0.10
            "replay": settings.WEIGHT_REPLAY                 # 0.10
        }

    def fuse_signals(
        self,
        voice_clone_score: float,          # 0.0 to 1.0 (1 = synthetic)
        speaker_match_score: float,        # 0.0 to 1.0 (1 = authentic trusted match)
        face_authenticity_score: float,    # 0.0 to 1.0 (1 = authentic)
        face_match_score: float,           # 0.0 to 1.0 (1 = authentic match)
        lip_sync_score: float,             # 0.0 to 1.0 (1 = synchronized)
        replay_score: float,               # 0.0 to 1.0 (1 = replay attack)
        scam_intent_score: float,          # 0.0 to 100.0 (100 = blatant scam intent)
        challenge_status: str = "NOT_TRIGGERED", # VERIFIED, FAILED, SUSPICIOUS, PENDING
        context_urgency: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates composite fraud probability and individual signal weights.
        """
        # Convert all features into fraud risk contributions [0.0 to 1.0]
        # High value = High Fraud Risk
        risk_voice = float(np.clip(voice_clone_score, 0.0, 1.0))
        risk_scam = float(np.clip(scam_intent_score / 100.0, 0.0, 1.0))
        risk_speaker = float(np.clip(1.0 - speaker_match_score, 0.0, 1.0))
        risk_face = float(np.clip(1.0 - (face_authenticity_score * 0.6 + face_match_score * 0.4), 0.0, 1.0))
        risk_lipsync = float(np.clip(1.0 - lip_sync_score, 0.0, 1.0))
        risk_replay = float(np.clip(replay_score, 0.0, 1.0))

        # Weighted combination
        raw_weighted_risk = (
            self.weights["voice_clone"] * risk_voice +
            self.weights["scam_intent"] * risk_scam +
            self.weights["speaker_mismatch"] * risk_speaker +
            self.weights["lip_sync_mismatch"] * risk_lipsync +
            self.weights["face_inauthenticity"] * risk_face +
            self.weights["replay"] * risk_replay
        )

        # Challenge adjustment
        if challenge_status == "VERIFIED":
            raw_weighted_risk *= 0.60 # Strong mitigation if legitimate challenge verified
        elif challenge_status == "FAILED":
            raw_weighted_risk = max(raw_weighted_risk, 0.85)
        elif challenge_status == "SUSPICIOUS":
            raw_weighted_risk = max(raw_weighted_risk, 0.72)

        # Context urgency boost
        if context_urgency and risk_scam > 0.4:
            raw_weighted_risk = min(1.0, raw_weighted_risk + 0.10)

        # Scaled to 0-100 integer
        overall_fraud_score = int(np.clip(round(raw_weighted_risk * 100.0), 0, 100))

        # Confidence calculation
        # Confidence increases with multi-modal agreement
        signals = [risk_voice, risk_scam, risk_speaker, risk_face, risk_lipsync, risk_replay]
        active_signals = [s for s in signals if s > 0.35]
        confidence = float(np.clip(0.72 + (len(active_signals) * 0.05), 0.75, 0.96))

        return {
            "overall_fraud_probability": round(raw_weighted_risk, 3),
            "overall_risk_score": overall_fraud_score,
            "confidence": round(confidence, 2),
            "signal_contributions": {
                "voice_authenticity": round(1.0 - risk_voice, 2),
                "voice_clone_probability": round(risk_voice, 2),
                "speaker_match_score": round(speaker_match_score, 2),
                "face_authenticity": round(face_authenticity_score, 2),
                "lip_sync_score": round(lip_sync_score, 2),
                "replay_probability": round(risk_replay, 2),
                "scam_intent_score": round(scam_intent_score, 1)
            }
        }
