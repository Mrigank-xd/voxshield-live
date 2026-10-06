import numpy as np
from typing import Dict, Any
from app.services.audio_processor import AudioProcessor

class ReplayDetector:
    """
    Acoustic Replay Attack Detector.
    Identifies whether incoming audio has been passed through a secondary loudspeaker
    and acoustic environment (speaker-to-microphone re-recording):
    - Dual reverberation tail & room impulse response signatures
    - High-frequency loudspeaker transducer cutoff (~3.5kHz - 4.5kHz acoustic rolloff)
    - Acoustic comb-filtering from multipath speaker reflections
    - Static background room hiss / electronic amplifier hum
    """
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.processor = AudioProcessor(sample_rate=sample_rate)

    def analyze_replay(self, audio_data: np.ndarray, timestamp: float) -> Dict[str, Any]:
        if len(audio_data) < self.sample_rate:
            return {
                "replay_probability": 0.05,
                "confidence": 0.60,
                "timestamp": timestamp,
                "indicators": ["Insufficient sample duration"]
            }

        stft_mag = self.processor.compute_stft(audio_data)
        freqs = np.linspace(0, self.sample_rate / 2, stft_mag.shape[0])
        
        # 1. High frequency acoustic decay
        # Loudspeakers often introduce severe attenuation above 4kHz compared to a direct mic
        energy_below_3k = np.sum(stft_mag[freqs < 3000, :])
        energy_above_4k = np.sum(stft_mag[freqs > 4000, :]) + 1e-10
        ratio_3k_4k = energy_below_3k / energy_above_4k

        # 2. Comb filtering detection: periodic notches in the frequency response
        # Caused by constructive/destructive acoustic reflections between speaker and secondary mic
        avg_spectrum = np.mean(stft_mag, axis=1)
        spec_diffs = np.diff(avg_spectrum)
        zero_crossings_in_diff = np.sum(np.diff(np.sign(spec_diffs)) != 0)

        # 3. Ambient noise floor consistency & reverberation tail
        # Calculate energy variance across unvoiced frames
        frame_energies = np.sum(stft_mag ** 2, axis=0)
        min_energy = np.percentile(frame_energies, 10)
        mean_energy = np.mean(frame_energies) + 1e-10
        noise_floor_ratio = min_energy / mean_energy

        indicators = []
        replay_prob = 0.08 # baseline low

        if ratio_3k_4k > 35.0:
            replay_prob += 0.28
            indicators.append("Acoustic transducer attenuation: Severe high-frequency rolloff typical of small speakers")

        if zero_crossings_in_diff > 45:
            replay_prob += 0.22
            indicators.append("Multipath comb filtering: Periodic spectral nulls from room reflection")

        if noise_floor_ratio > 0.15:
            replay_prob += 0.20
            indicators.append("Convoluted background noise floor: Secondary room acoustic ambiance detected")

        # Cap probabilistic replay score conservatively (never jump to 1.0)
        replay_prob = float(np.clip(replay_prob, 0.04, 0.88))
        confidence = float(np.clip(0.70 + (min(len(audio_data) / self.sample_rate, 5.0) * 0.04), 0.70, 0.92))

        return {
            "replay_probability": round(replay_prob, 3),
            "confidence": round(confidence, 3),
            "timestamp": round(timestamp, 2),
            "indicators": indicators,
            "transducer_ratio": round(float(ratio_3k_4k), 2),
            "noise_floor_ratio": round(float(noise_floor_ratio), 4)
        }
