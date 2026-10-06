from typing import Dict, Any, List, Optional
from app.config import settings
from app.services.fusion_engine import FusionEngine
import numpy as np

class MultiLayerRiskEngine:
    """
    Central Fraud Risk Engine & Explainable AI Orchestrator.
    Implements:
    - Multi-layer evidence accumulation (exponential moving average over call duration)
    - Graduated alert state machine (LOW -> MEDIUM -> HIGH -> CRITICAL)
    - Transparent, non-accusing Explainable AI factors
    - Actionable cybersecurity recommendations
    """
    def __init__(self):
        self.fusion_engine = FusionEngine()

    def calculate_call_risk(
        self,
        voice_clone_score: float,
        speaker_match_score: float,
        face_authenticity_score: float,
        face_match_score: float,
        lip_sync_score: float,
        replay_score: float,
        scam_intent_score: float,
        detected_scam_categories: List[str],
        previous_risk_score: Optional[int] = None,
        challenge_status: str = "NOT_TRIGGERED",
        context_urgency: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates instantaneous fused risk and applies exponential smoothing.
        Prevents jittery 0->100 spikes on single momentary acoustic artifacts.
        """
        fused = self.fusion_engine.fuse_signals(
            voice_clone_score=voice_clone_score,
            speaker_match_score=speaker_match_score,
            face_authenticity_score=face_authenticity_score,
            face_match_score=face_match_score,
            lip_sync_score=lip_sync_score,
            replay_score=replay_score,
            scam_intent_score=scam_intent_score,
            challenge_status=challenge_status,
            context_urgency=context_urgency
        )

        instant_score = fused["overall_risk_score"]

        # Temporal evidence smoothing
        if previous_risk_score is not None:
            # If critical scam intent detected (e.g. OTP requested), allow faster elevation
            if "OTP_REQUEST" in detected_scam_categories or instant_score >= 70:
                alpha = 0.75
            else:
                alpha = 0.40
            smoothed_score = int(alpha * instant_score + (1.0 - alpha) * previous_risk_score)
        else:
            smoothed_score = instant_score

        # Bound 0-100
        overall_risk_score = int(np.clip(smoothed_score, 0, 100))

        # Risk Level & Graduated Alert determination
        if overall_risk_score >= settings.RISK_THRESHOLD_CRITICAL:
            risk_level = "CRITICAL"
            graduated_alert = "CRITICAL_INTERVENTION"
            alert_message = "CRITICAL ALERT: Multiple high-risk fraud indicators detected. Cease sensitive actions immediately."
            recommended_action = "Require independent out-of-band verification before sharing any data or funds."
        elif overall_risk_score >= settings.RISK_THRESHOLD_HIGH:
            risk_level = "HIGH"
            graduated_alert = "PROMINENT_WARNING"
            alert_message = "HIGH RISK: The caller is requesting sensitive financial credentials or exhibiting synthetic speech traits."
            recommended_action = "Do not share OTP, PIN, or initiate transfers. Verify caller identity independently."
        elif overall_risk_score >= settings.RISK_THRESHOLD_MEDIUM:
            risk_level = "MEDIUM"
            graduated_alert = "ELEVATED_MONITORING"
            alert_message = "CAUTION: Moderate conversational urgency or biometric inconsistency detected."
            recommended_action = "Remain vigilant. Pay attention to any unsolicited financial requests."
        else:
            risk_level = "LOW"
            graduated_alert = "SILENT_MONITORING"
            alert_message = None
            recommended_action = "Silent continuous monitoring. No anomalous indicators detected."

        # Explainable AI Factors generation
        explanations = []
        if voice_clone_score >= 0.60:
            explanations.append("+ Synthetic speech indicators detected (sub-biological micro-jitter / vocoder artifact)")
        if speaker_match_score < 0.70:
            explanations.append("+ Speaker does not strongly match trusted biometric profile")
        if "OTP_REQUEST" in detected_scam_categories:
            explanations.append("+ Caller requested one-time passcode (OTP) or security credential")
        if "URGENCY_COERCION" in detected_scam_categories:
            explanations.append("+ Unusual psychological urgency or coercion detected")
        if "MONEY_TRANSFER" in detected_scam_categories:
            explanations.append("+ Direct financial transfer or beneficiary creation solicited")
        if "REMOTE_ACCESS" in detected_scam_categories:
            explanations.append("+ Remote device access application installation requested")
        if lip_sync_score < 0.50:
            explanations.append("+ Audio-visual lip-sync discrepancy detected (mouth motion out of phase with vocal onsets)")
        if replay_score > 0.50:
            explanations.append("+ Acoustic room reverberation / loudspeaker re-recording signature detected")
        if face_authenticity_score < 0.65:
            explanations.append("+ Live webcam facial manipulation / deepfake artifact markers detected")
        if challenge_status == "FAILED":
            explanations.append("+ Dynamic challenge-response failed")

        if not explanations:
            explanations.append("+ Vocal dynamics and conversation flow match natural human baseline")

        return {
            "overall_risk_score": overall_risk_score,
            "risk_level": risk_level,
            "confidence": fused["confidence"],
            "graduated_alert_level": graduated_alert,
            "alert_message": alert_message,
            "recommended_action": recommended_action,
            "explanations": explanations,
            "signal_contributions": fused["signal_contributions"]
        }
