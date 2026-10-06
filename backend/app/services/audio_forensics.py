import numpy as np
from typing import Dict, Any, List
from app.services.audio_processor import AudioProcessor

class AudioForensicsService:
    """
    Forensic Audio Inspection Engine.
    Produces downsampled interactive visualization payloads (waveform, 64-band Mel spectrogram,
    pitch contour, formants, MFCCs) suitable for investigator drilldown.
    """
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.processor = AudioProcessor(sample_rate=sample_rate)

    def extract_forensic_packet(self, audio_data: np.ndarray, timestamp: float) -> Dict[str, Any]:
        duration_s = float(len(audio_data) / self.sample_rate)
        
        # 1. Downsampled Waveform points (100 points for real-time frontend chart)
        num_points = 100
        if len(audio_data) >= num_points:
            step = len(audio_data) // num_points
            waveform_sample = [round(float(audio_data[i * step]), 4) for i in range(num_points)]
        else:
            waveform_sample = [round(float(x), 4) for x in audio_data.tolist()]

        # 2. Mel-Spectrogram matrix (downsampled to 16 time slices x 16 mel frequency bands for fast UI transmission)
        mel_full = self.processor.compute_mel_spectrogram(audio_data) # [64, time_frames]
        n_mels, n_frames = mel_full.shape
        mel_grid = []
        if n_frames > 0:
            target_time_steps = min(20, n_frames)
            target_freq_bins = 16
            time_indices = np.linspace(0, n_frames - 1, target_time_steps).astype(int)
            freq_indices = np.linspace(0, n_mels - 1, target_freq_bins).astype(int)
            
            sub_mel = mel_full[freq_indices, :][:, time_indices]
            # Normalize to 0-100 dB scale
            min_val = np.min(sub_mel)
            max_val = np.max(sub_mel) + 1e-6
            norm_mel = ((sub_mel - min_val) / (max_val - min_val) * 100.0).tolist()
            mel_grid = [[round(val, 1) for val in row] for row in norm_mel]

        # 3. MFCC 13 coefficients
        mfcc_mat = self.processor.compute_mfcc(audio_data)
        mfcc_features = [round(float(np.mean(mfcc_mat[i, :])), 3) for i in range(min(13, mfcc_mat.shape[0]))]

        # 4. Pitch & Perturbation
        pitch_mean, pitch_std, jitter, shimmer = self.processor.estimate_pitch_and_perturbation(audio_data)
        
        # Pitch contour sample (20 points)
        frame_len = int(0.05 * self.sample_rate)
        hop = max(1, (len(audio_data) - frame_len) // 20)
        pitch_contour = []
        for i in range(20):
            idx = i * hop
            if idx + frame_len <= len(audio_data):
                f_seg = audio_data[idx : idx + frame_len]
                pm, _, _, _ = self.processor.estimate_pitch_and_perturbation(f_seg)
                pitch_contour.append(round(pm, 1))
            else:
                pitch_contour.append(round(pitch_mean, 1))

        # 5. Energy Envelope (RMS per frame)
        energy_envelope = []
        for i in range(20):
            idx = i * hop
            if idx + frame_len <= len(audio_data):
                rms = float(np.sqrt(np.mean(audio_data[idx:idx+frame_len] ** 2)))
                energy_envelope.append(round(rms * 100.0, 2))
            else:
                energy_envelope.append(10.0)

        # 6. Spectral Features
        spec_features = self.processor.compute_spectral_features(audio_data)

        # 7. Formants
        formants = self.processor.estimate_formants(audio_data)

        # Identify Forensic Anomalies
        anomalies = []
        if jitter < 0.003:
            anomalies.append("Sub-biological jitter anomaly (<0.3%)")
        if spec_features["spectral_flatness"] > 0.07:
            anomalies.append("Elevated high-frequency spectral flatness (vocoder signature)")
        if pitch_std < 8.0:
            anomalies.append("Atypical flat prosody (robotic vocal tract)")

        return {
            "timestamp": round(timestamp, 2),
            "duration_s": round(duration_s, 2),
            "waveform_sample": waveform_sample,
            "mel_spectrogram": mel_grid,
            "mfcc_features": mfcc_features,
            "pitch_contour": pitch_contour,
            "pitch_mean": round(pitch_mean, 1),
            "pitch_std": round(pitch_std, 1),
            "jitter": round(jitter, 4),
            "shimmer": round(shimmer, 4),
            "energy_envelope": energy_envelope,
            "spectral_centroid": round(spec_features["spectral_centroid"], 1),
            "spectral_rolloff": round(spec_features["spectral_rolloff"], 1),
            "spectral_flatness": round(spec_features["spectral_flatness"], 4),
            "zero_crossing_rate": round(spec_features["zero_crossing_rate"], 4),
            "formants": formants,
            "anomalies": anomalies
        }
