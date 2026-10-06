import numpy as np

def normalize_audio(audio: np.ndarray, target_peak: float = 0.95) -> np.ndarray:
    """Normalize audio float32 buffer to target peak amplitude."""
    peak = np.max(np.abs(audio))
    if peak > 0:
        return audio * (target_peak / peak)
    return audio

def frame_audio(audio: np.ndarray, frame_length: int, hop_length: int) -> np.ndarray:
    """Slice audio into overlapping windows."""
    num_frames = 1 + int((len(audio) - frame_length) / hop_length)
    if num_frames <= 0:
        return np.array([audio])
    frames = np.lib.stride_tricks.as_strided(
        audio,
        shape=(num_frames, frame_length),
        strides=(audio.strides[0] * hop_length, audio.strides[0])
    )
    return frames
