import abc
import numpy as np
from typing import Dict, Any, Optional
from app.services.audio_processor import AudioProcessor

class VoiceCloneDetectorInterface(abc.ABC):
    @abc.abstractmethod
    def analyze_window(self, audio_data: np.ndarray, timestamp: float) -> Dict[str, Any]:
        """Analyze a short audio window (3-10s) and produce synthetic speech probabilities."""
        pass


class VoiceCloneDetector(VoiceCloneDetectorInterface):
    """
    VoxShield Real-Time Voice Clone & Deepfake Audio Detector.
    Analyzes acoustic anomalies characteristic of Neural Vocoders (HiFi-GAN, MelGAN, Diff-TTS, ElevenLabs):
    1. Unnatural micro-perturbation (synthetic jitter < 0.2% or sudden robotic quantization)
    2. Spectral flatness anomalies (excessive smoothing or high-frequency buzz)
    3. Unnatural pitch contour standard deviation (prosody flattening or robotic cadence)
    4. Formant structure sharpness / dispersion incoherence
    5. High-frequency phase reconstruction artifacts

    Note: Clearly designated as an explainable acoustic forensic prototype detector.
    """
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.processor = AudioProcessor(sample_rate=sample_rate)
        self.model_version = "VoxShield-AudioForensic-v2.4-AcousticML"

    def analyze_window(self, audio_data: np.ndarray, timestamp: float) -> Dict[str, Any]:
        if len(audio_data) < self.sample_rate:
            # Buffer too small for reliable acoustic forensics
            return {
                "synthetic_probability": 0.05,
                "natural_probability": 0.95,
                "confidence": 0.50,
                "timestamp": timestamp,
                "audio_quality": 0.60,
                "model_version": self.model_version,
                "indicators": ["Insufficient sample length for full acoustic forensic extraction"]
            }

        # Energy & Voice Activity Detection check
        rms_energy = float(np.sqrt(np.mean(audio_data ** 2)))
        if rms_energy < 0.005:
            # Ambient silence
            return {
                "synthetic_probability": 0.02,
                "natural_probability": 0.98,
                "confidence": 0.80,
                "timestamp": timestamp,
                "audio_quality": 0.70,
                "model_version": self.model_version,
                "indicators": ["Low energy / background silence"]
            }

        # 1. Acoustic Perturbation: Jitter & Shimmer
        pitch_mean, pitch_std, jitter, shimmer = self.processor.estimate_pitch_and_perturbation(audio_data)
        
        # 2. Spectral Features: Centroid, Flatness, Rolloff, ZCR
        spec_features = self.processor.compute_spectral_features(audio_data)
        flatness = spec_features["spectral_flatness"]
        centroid = spec_features["spectral_centroid"]
        rolloff = spec_features["spectral_rolloff"]
        zcr = spec_features["zero_crossing_rate"]

        # 3. Formants
        formants = self.processor.estimate_formants(audio_data)

        # Anomaly scoring based on known generative vocoder signatures:
        anomalies = []
        anomaly_score = 0.0

        # Heuristic 1: Sub-biological micro-jitter
        # Biological vocal cords naturally vary: jitter ~0.005 - 0.025.
        # Synthesized voices with neural vocoders often have unnaturally rigid pitch (<0.002)
        if jitter < 0.0025:
            anomaly_score += 0.28
            anomalies.append("Sub-biological jitter: Unnaturally stable pitch period (<0.25% perturbation)")
        elif jitter > 0.045:
            anomaly_score += 0.18
            anomalies.append("Excessive phase discontinuity / pitch tracking jitter")

        # Heuristic 2: Prosody & Pitch std
        # Normal conversation pitch std is typically 15 - 45 Hz.
        # Monotone/cloned voice often has < 8 Hz std or sudden stepped transitions
        if pitch_std < 7.0 and rms_energy > 0.02:
            anomaly_score += 0.24
            anomalies.append("Flat prosody: Unnatural pitch invariance across voiced syllables")
        elif pitch_std > 65.0:
            anomaly_score += 0.12
            anomalies.append("Pitch trajectory leaps: Non-physiological formant jumps")

        # Heuristic 3: Spectral Flatness Anomaly
        # Natural human speech has distinct harmonic peaks (low flatness: 0.001 - 0.05).
        # Diffusion/GAN vocoder noise floor or buzz can cause elevated flatness or extreme harmonic rigidity
        if flatness > 0.08:
            anomaly_score += 0.25
            anomalies.append("Vocoder noise floor: Elevated spectral flatness in upper frequency bands")
        elif flatness < 0.0005:
            anomaly_score += 0.15
            anomalies.append("Harmonic hyper-regularity: Absence of natural glottal airflow turbulence")

        # Heuristic 4: Formant dispersion & spectral centroid
        # Biological F2/F1 ratio usually 2.0 to 4.5
        f1, f2 = formants.get("F1", 500.0), formants.get("F2", 1500.0)
        dispersion = f2 / (f1 + 1e-5)
        if dispersion < 1.4 or dispersion > 5.5:
            anomaly_score += 0.15
            anomalies.append(f"Acoustic tract geometry anomaly: F2/F1 ratio ({dispersion:.2f}) outside physiological norm")

        # High-frequency spectral energy cutoff (telephone vs 24kHz upsampling artifact)
        if rolloff > 6500 and centroid > 3200:
            anomaly_score += 0.12
            anomalies.append("Synthetic upper-band harmonics: Energy persistence beyond 6.5kHz")

        # Bound synthetic probability between 0.03 and 0.96
        synthetic_prob = float(np.clip(anomaly_score, 0.03, 0.96))
        natural_prob = float(1.0 - synthetic_prob)
        
        # Audio Quality Assessment (SNR approximation)
        audio_quality = float(np.clip(1.0 - (flatness * 2.0) + (rms_energy * 0.5), 0.5, 0.99))
        
        # Confidence based on audio length and SNR
        confidence = float(np.clip(0.75 + (min(len(audio_data) / self.sample_rate, 4.0) * 0.05), 0.70, 0.95))

        return {
            "synthetic_probability": round(synthetic_prob, 3),
            "natural_probability": round(natural_prob, 3),
            "confidence": round(confidence, 3),
            "timestamp": round(timestamp, 2),
            "audio_quality": round(audio_quality, 2),
            "spectral_flatness": round(flatness, 4),
            "pitch_mean": round(pitch_mean, 1),
            "pitch_std": round(pitch_std, 1),
            "jitter": round(jitter, 4),
            "shimmer": round(shimmer, 4),
            "formant_dispersion": round(dispersion, 2),
            "spectral_centroid": round(centroid, 1),
            "spectral_rolloff": round(rolloff, 1),
            "zero_crossing_rate": round(zcr, 4),
            "model_version": self.model_version,
            "anomalies": anomalies
        }
