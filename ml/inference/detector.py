import numpy as np
from app.services.voice_clone_detector import VoiceCloneDetector

class OfflineBatchInference:
    """Batch inference runner for offline audio file forensic evaluation."""
    def __init__(self, sample_rate: int = 16000):
        self.detector = VoiceCloneDetector(sample_rate=sample_rate)

    def evaluate_file_stream(self, audio_array: np.ndarray, window_size: int = 48000, hop: int = 16000):
        results = []
        for i in range(0, len(audio_array) - window_size, hop):
            chunk = audio_array[i : i + window_size]
            ts = float(i / self.detector.sample_rate)
            res = self.detector.analyze_window(chunk, ts)
            results.append(res)
        return results
