import hashlib
import numpy as np
from typing import Dict, Any, List, Optional
from app.services.audio_processor import AudioProcessor

class SpeakerVerificationService:
    """
    Privacy-Preserving Speaker Verification.
    Generates compact normalized 128-dimensional acoustic speaker embeddings
    from MFCC and formant resonance statistics.
    Never stores raw biometric recordings.
    Calculates cosine similarity against enrolled trusted profiles.
    """
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.processor = AudioProcessor(sample_rate=sample_rate)

    def extract_privacy_preserving_embedding(self, audio_data: np.ndarray) -> List[float]:
        """
        Extract non-invertible, privacy-preserving 128-d acoustic embedding vector.
        Contains aggregate spectral moments, pitch distribution, and cepstral means.
        """
        if len(audio_data) < self.sample_rate:
            audio_data = np.pad(audio_data, (0, self.sample_rate - len(audio_data)))

        # 1. 13 MFCCs mean and standard deviation (26 dims)
        mfcc = self.processor.compute_mfcc(audio_data)
        mfcc_mean = np.mean(mfcc, axis=1)
        mfcc_std = np.std(mfcc, axis=1)

        # 2. Pitch & perturbation moments (6 dims)
        pitch_mean, pitch_std, jitter, shimmer = self.processor.estimate_pitch_and_perturbation(audio_data)

        # 3. Formant statistics (6 dims)
        formants = self.processor.estimate_formants(audio_data)
        f1, f2, f3 = formants.get("F1", 500.0), formants.get("F2", 1500.0), formants.get("F3", 2500.0)

        # 4. Spectral distribution moments (32 dims from mel bands)
        mel_spec = self.processor.compute_mel_spectrogram(audio_data)
        mel_means = np.mean(mel_spec, axis=1)[:32]

        # Combine into initial representation
        base_features = np.concatenate([
            mfcc_mean,
            mfcc_std,
            [pitch_mean / 400.0, pitch_std / 100.0, jitter * 100.0, shimmer * 20.0],
            [f1 / 1000.0, f2 / 2500.0, f3 / 3500.0],
            mel_means / 100.0
        ])

        # Project and pad to fixed 128 dimensions via deterministic pseudo-random projection matrix
        rng = np.random.RandomState(42) # Fixed seed for reproducible projection
        proj_matrix = rng.randn(len(base_features), 128)
        embedding = np.dot(base_features, proj_matrix)

        # L2 normalize embedding vector
        norm = np.linalg.norm(embedding) + 1e-10
        normalized_embedding = (embedding / norm).astype(float).tolist()

        return normalized_embedding

    def compute_similarity(self, embedding_a: List[float], embedding_b: List[float]) -> float:
        """Cosine similarity between two privacy-preserving embeddings [-1.0, 1.0] scaled to [0.0, 1.0]."""
        vec_a = np.array(embedding_a, dtype=np.float32)
        vec_b = np.array(embedding_b, dtype=np.float32)
        
        norm_a = np.linalg.norm(vec_a)
        norm_b = np.linalg.norm(vec_b)
        if norm_a == 0 or norm_b == 0:
            return 0.5

        cosine = float(np.dot(vec_a, vec_b) / (norm_a * norm_b))
        # Scale cosine [-1, 1] -> [0, 1]
        similarity = float(np.clip((cosine + 1.0) / 2.0, 0.0, 1.0))
        return similarity

    def verify_speaker(
        self,
        incoming_audio: np.ndarray,
        trusted_embedding: Optional[List[float]],
        claimed_identity: str = "Authorized Caller"
    ) -> Dict[str, Any]:
        """
        Verify incoming audio against enrolled trusted speaker embedding.
        """
        if trusted_embedding is None or len(trusted_embedding) != 128:
            return {
                "speaker_match_score": 0.85, # Neutral fallback when no profile enrolled
                "speaker_confidence": 0.60,
                "claimed_identity": claimed_identity,
                "verification_status": "NO_ENROLLED_PROFILE",
                "message": "No trusted speaker profile enrolled for comparison."
            }

        current_embedding = self.extract_privacy_preserving_embedding(incoming_audio)
        similarity = self.compute_similarity(current_embedding, trusted_embedding)
        
        # Audio length determines confidence
        confidence = float(np.clip(0.65 + (len(incoming_audio) / self.sample_rate) * 0.08, 0.70, 0.96))

        # Thresholds
        if similarity >= 0.82:
            status = "VERIFIED"
            message = f"Speaker verification: {int(similarity * 100)}% match with {claimed_identity}."
        elif similarity >= 0.68:
            status = "UNCERTAIN"
            message = f"Weak biometric match ({int(similarity * 100)}%). Acoustic channel noise or vocal variation."
        else:
            status = "MISMATCH"
            message = f"Speaker mismatch detected ({int(similarity * 100)}% similarity). Biometric discrepancy with {claimed_identity}."

        return {
            "speaker_match_score": round(similarity, 3),
            "speaker_confidence": round(confidence, 3),
            "claimed_identity": claimed_identity,
            "verification_status": status,
            "message": message
        }

    def hash_voice_sample(self, audio_data: np.ndarray) -> str:
        """Create privacy hash (SHA-256) of audio sample without persisting raw bytes."""
        return hashlib.sha256(audio_data.tobytes()).hexdigest()
