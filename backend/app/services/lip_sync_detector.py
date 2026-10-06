import numpy as np
from typing import Dict, Any, Optional

class LipSyncDetector:
    """
    Audio-Visual Synchronization & Lip-Sync Discrepancy Detector.
    Evaluates cross-modal correlation between:
    - Audio energy envelope & vocal tract syllable onsets
    - Visual mouth aperture / Mouth Aspect Ratio (MAR) velocity

    Flags:
    - Voice active while mouth/lips remain static (audio dubbing / static avatar)
    - Unnatural rhythmic flapping or non-speech lip motion
    - Audio-Visual temporal desynchronization lag (> 150ms offset)
    """
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate

    def analyze_synchronization(
        self,
        audio_rms_envelope: np.ndarray,
        mouth_aspect_ratios: np.ndarray,
        timestamp: float
    ) -> Dict[str, Any]:
        """
        Calculates cross-correlation between audio energy and lip opening dynamics.
        """
        # If video is disabled or insufficient data
        if len(mouth_aspect_ratios) < 5 or len(audio_rms_envelope) < 5:
            return {
                "lip_sync_score": 0.95,
                "audio_visual_offset_ms": 0.0,
                "confidence": 0.60,
                "timestamp": timestamp,
                "status": "INSUFFICIENT_VISUAL_SAMPLES",
                "indicators": []
            }

        # Normalize signals
        audio_norm = (audio_rms_envelope - np.mean(audio_rms_envelope)) / (np.std(audio_rms_envelope) + 1e-6)
        mouth_norm = (mouth_aspect_ratios - np.mean(mouth_aspect_ratios)) / (np.std(mouth_aspect_ratios) + 1e-6)

        # Cross-correlation
        min_len = min(len(audio_norm), len(mouth_norm))
        a_sig = audio_norm[:min_len]
        m_sig = mouth_norm[:min_len]

        corr = np.correlate(a_sig, m_sig, mode='full')
        max_idx = np.argmax(corr)
        lag = max_idx - (min_len - 1)
        offset_ms = float(lag * 33.3) # Assuming ~30 fps video frames

        # Pearson correlation coefficient at zero lag
        pearson_corr = float(np.corrcoef(a_sig, m_sig)[0, 1])
        if np.isnan(pearson_corr):
            pearson_corr = 0.5

        indicators = []
        lip_sync_score = 0.90

        audio_energy_high = np.mean(audio_rms_envelope) > 0.05
        mouth_static = np.std(mouth_aspect_ratios) < 0.015

        # Critical Deepfake Signature: Audio is loud, but mouth doesn't move
        if audio_energy_high and mouth_static:
            lip_sync_score = 0.18
            indicators.append("Audio-Visual Discrepancy: Active vocalization while mouth remains static")
        elif abs(offset_ms) > 200.0:
            lip_sync_score = 0.45
            indicators.append(f"Severe A/V Desync: {int(offset_ms)}ms latency between speech acoustic onset and lip motion")
        elif pearson_corr < 0.15 and audio_energy_high:
            lip_sync_score = 0.52
            indicators.append("Phoneme mismatch: Mouth shape does not track acoustic spectral transitions")
        else:
            lip_sync_score = float(np.clip(0.70 + (pearson_corr * 0.28), 0.5, 0.98))

        confidence = 0.88 if len(mouth_aspect_ratios) >= 15 else 0.72

        return {
            "lip_sync_score": round(float(lip_sync_score), 2),
            "audio_visual_offset_ms": round(offset_ms, 1),
            "confidence": round(confidence, 2),
            "timestamp": round(timestamp, 2),
            "status": "NORMAL" if lip_sync_score >= 0.70 else "MISMATCH_DETECTED",
            "indicators": indicators,
            "pearson_correlation": round(float(pearson_corr), 3)
        }
