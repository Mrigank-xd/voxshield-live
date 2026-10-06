import base64
import io
import math
import struct
import numpy as np
from scipy import signal
from scipy.fft import dct

class AudioProcessor:
    """
    Core acoustic signal processing engine.
    Extracts time-frequency representations, cepstral features,
    and vocal perturbation metrics for forensic AI analysis.
    """
    def __init__(self, sample_rate: int = 16000):
        self.sample_rate = sample_rate
        self.n_fft = 512
        self.hop_length = 160 # 10ms hop
        self.n_mels = 64
        self.n_mfcc = 13
        self._mel_basis = self._create_mel_filterbank(self.sample_rate, self.n_fft, self.n_mels)

    def decode_audio_bytes(self, raw_bytes: bytes) -> np.ndarray:
        """Decode raw 16-bit PCM, WAV, or float32 audio bytes to float32 numpy array [-1.0, 1.0]."""
        if not raw_bytes:
            return np.zeros(self.sample_rate * 3, dtype=np.float32)

        # Check for WAV header 'RIFF'
        if raw_bytes[:4] == b'RIFF' and len(raw_bytes) > 44:
            try:
                from scipy.io import wavfile
                sr_in, audio = wavfile.read(io.BytesIO(raw_bytes))
                if audio.dtype == np.int16:
                    audio = audio.astype(np.float32) / 32768.0
                elif audio.dtype == np.int32:
                    audio = audio.astype(np.float32) / 2147483648.0
                elif audio.dtype == np.uint8:
                    audio = (audio.astype(np.float32) - 128.0) / 128.0
                else:
                    audio = audio.astype(np.float32)
                
                # Convert multi-channel / stereo to mono
                if len(audio.shape) > 1:
                    audio = np.mean(audio, axis=1)
                
                # Resample to target sample_rate if needed (e.g. 44.1kHz / 48kHz browser audio -> 16kHz)
                if sr_in != self.sample_rate and len(audio) > 0:
                    num_samples = int(len(audio) * float(self.sample_rate) / sr_in)
                    if num_samples > 0:
                        audio = signal.resample(audio, num_samples)
                return audio.astype(np.float32)
            except Exception:
                pass

        # Try int16 PCM
        try:
            audio = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            return audio
        except Exception:
            # Fallback to float32 buffer
            try:
                return np.frombuffer(raw_bytes, dtype=np.float32)
            except Exception:
                return np.zeros(self.sample_rate * 3, dtype=np.float32)

    def decode_base64_audio(self, b64_string: str) -> np.ndarray:
        """Decode base64 encoded audio chunk."""
        if not b64_string:
            return np.zeros(self.sample_rate * 3, dtype=np.float32)
        try:
            # Strip data URL header if present
            if "," in b64_string:
                b64_string = b64_string.split(",", 1)[1]
            raw_bytes = base64.b64decode(b64_string)
            return self.decode_audio_bytes(raw_bytes)
        except Exception:
            return np.zeros(self.sample_rate * 3, dtype=np.float32)

    def compute_stft(self, audio: np.ndarray) -> np.ndarray:
        """Compute short-time Fourier transform magnitude spectrogram."""
        if len(audio) < self.n_fft:
            audio = np.pad(audio, (0, self.n_fft - len(audio)))
        _, _, Zxx = signal.stft(audio, fs=self.sample_rate, nperseg=self.n_fft, noverlap=self.n_fft - self.hop_length)
        return np.abs(Zxx)

    def _create_mel_filterbank(self, sr: int, n_fft: int, n_mels: int) -> np.ndarray:
        """Construct Mel triangular filterbank matrix."""
        low_freq = 0
        high_freq = sr / 2
        
        # Convert Hz to Mel
        def hz_to_mel(f):
            return 2595.0 * np.log10(1.0 + f / 700.0)
        
        def mel_to_hz(m):
            return 700.0 * (10.0 ** (m / 2595.0) - 1.0)

        low_mel = hz_to_mel(low_freq)
        high_mel = hz_to_mel(high_freq)
        mel_points = np.linspace(low_mel, high_mel, n_mels + 2)
        hz_points = mel_to_hz(mel_points)
        bin_points = np.floor((n_fft + 1) * hz_points / sr).astype(int)

        num_fft_bins = n_fft // 2 + 1
        filterbank = np.zeros((n_mels, num_fft_bins), dtype=np.float32)
        for i in range(1, n_mels + 1):
            left = bin_points[i - 1]
            center = bin_points[i]
            right = bin_points[i + 1]
            
            for j in range(left, center):
                if center > left and j < num_fft_bins:
                    filterbank[i - 1, j] = (j - left) / (center - left)
            for j in range(center, right):
                if right > center and j < num_fft_bins:
                    filterbank[i - 1, j] = (right - j) / (right - center)

        return filterbank

    def compute_mel_spectrogram(self, audio: np.ndarray) -> np.ndarray:
        """Compute Mel-spectrogram in decibels."""
        stft_mag = self.compute_stft(audio)
        num_bins = self.n_fft // 2 + 1
        stft_mag = stft_mag[:num_bins, :]
        mel_spec = np.dot(self._mel_basis, stft_mag ** 2)
        mel_spec_db = 10.0 * np.log10(np.maximum(mel_spec, 1e-10))
        return mel_spec_db

    def compute_mfcc(self, audio: np.ndarray) -> np.ndarray:
        """Compute Mel-frequency cepstral coefficients (MFCCs)."""
        mel_spec_db = self.compute_mel_spectrogram(audio)
        # Discrete Cosine Transform (DCT-II)
        mfcc = dct(mel_spec_db, axis=0, type=2, norm='ortho')[:self.n_mfcc, :]
        return mfcc

    def estimate_pitch_and_perturbation(self, audio: np.ndarray) -> Tuple[float, float, float, float]:
        """
        Estimate fundamental frequency F0 (pitch), jitter, and shimmer.
        Natural biological voices exhibit slight vocal cord instability:
        - Natural Jitter: 0.5% - 2.0%
        - Natural Shimmer: 2.0% - 6.0%
        Neural vocoders (e.g. HiFi-GAN, WaveGlow) or TTS often have unnaturally static
        periods (jitter < 0.1%) or sudden micro-phase discontinuities.
        """
        if len(audio) < self.sample_rate // 2:
            return 140.0, 10.0, 0.008, 0.025

        # Frame based autocorrelation for pitch
        frame_len = int(0.04 * self.sample_rate) # 40ms frame
        hop = int(0.02 * self.sample_rate)
        num_frames = (len(audio) - frame_len) // hop
        if num_frames <= 0:
            return 140.0, 10.0, 0.008, 0.025

        pitches = []
        amplitudes = []
        min_lag = int(self.sample_rate / 400) # 400Hz max pitch
        max_lag = int(self.sample_rate / 60)  # 60Hz min pitch

        for i in range(num_frames):
            frame = audio[i * hop : i * hop + frame_len]
            # Energy check
            rms = np.sqrt(np.mean(frame ** 2) + 1e-10)
            if rms < 0.01:
                continue # unvoiced / silence

            amplitudes.append(rms)
            # Autocorrelation
            corr = np.correlate(frame, frame, mode='full')
            corr = corr[len(corr) // 2:]
            search_window = corr[min_lag:max_lag]
            if len(search_window) > 0:
                peak_lag = min_lag + np.argmax(search_window)
                if corr[peak_lag] > 0.3 * corr[0]:
                    pitch_hz = self.sample_rate / peak_lag
                    pitches.append(pitch_hz)

        if len(pitches) < 3:
            return 150.0, 12.0, 0.01, 0.03

        pitch_arr = np.array(pitches)
        pitch_mean = float(np.mean(pitch_arr))
        pitch_std = float(np.std(pitch_arr))

        # Jitter calculation (relative average perturbation of periods)
        periods = 1.0 / pitch_arr
        period_diffs = np.abs(np.diff(periods))
        jitter = float(np.mean(period_diffs) / (np.mean(periods) + 1e-8))

        # Shimmer calculation (relative average perturbation of amplitudes)
        if len(amplitudes) >= 2:
            amp_arr = np.array(amplitudes)
            amp_diffs = np.abs(np.diff(amp_arr))
            shimmer = float(np.mean(amp_diffs) / (np.mean(amp_arr) + 1e-8))
        else:
            shimmer = 0.03

        return pitch_mean, pitch_std, jitter, shimmer

    def compute_spectral_features(self, audio: np.ndarray) -> Dict[str, float]:
        """Compute spectral centroid, rolloff, flatness, and zero-crossing rate."""
        stft_mag = self.compute_stft(audio)
        freqs = np.linspace(0, self.sample_rate / 2, stft_mag.shape[0])
        
        # Spectral Centroid
        centroid_num = np.sum(freqs[:, np.newaxis] * stft_mag, axis=0)
        centroid_denom = np.sum(stft_mag, axis=0) + 1e-10
        centroid = float(np.mean(centroid_num / centroid_denom))

        # Spectral Flatness: geometric mean / arithmetic mean of power spectrum
        power = stft_mag ** 2 + 1e-12
        geom_mean = np.exp(np.mean(np.log(power), axis=0))
        arith_mean = np.mean(power, axis=0)
        flatness = float(np.mean(geom_mean / (arith_mean + 1e-10)))

        # Spectral Rolloff (85% energy threshold)
        cumulative_power = np.cumsum(power, axis=0)
        total_power = cumulative_power[-1, :]
        rolloff_idx = np.apply_along_axis(lambda col: np.searchsorted(col, 0.85 * col[-1]), 0, cumulative_power)
        rolloff_freq = float(np.mean(freqs[np.clip(rolloff_idx, 0, len(freqs) - 1)]))

        # Zero Crossing Rate
        zero_crossings = np.sum(np.abs(np.diff(np.sign(audio)))) / (2.0 * len(audio) + 1e-8)

        return {
            "spectral_centroid": centroid,
            "spectral_flatness": flatness,
            "spectral_rolloff": rolloff_freq,
            "zero_crossing_rate": float(zero_crossings)
        }

    def estimate_formants(self, audio: np.ndarray) -> Dict[str, float]:
        """
        Estimate vocal tract formants F1, F2, F3 using spectral peak picking.
        Formants are fundamental to human vocal tract resonance geometry.
        """
        stft_mag = np.mean(self.compute_stft(audio), axis=1)
        freqs = np.linspace(0, self.sample_rate / 2, len(stft_mag))
        
        # Smooth envelope
        window = np.ones(9) / 9.0
        smoothed = np.convolve(stft_mag, window, mode='same')
        peaks, _ = signal.find_peaks(smoothed, distance=10, prominence=0.05)

        formants = {"F1": 500.0, "F2": 1500.0, "F3": 2500.0}
        f_peaks = freqs[peaks]
        
        # Categorize peaks into realistic anatomical resonance bands
        f1_cands = [f for f in f_peaks if 250 <= f <= 900]
        f2_cands = [f for f in f_peaks if 900 < f <= 2300]
        f3_cands = [f for f in f_peaks if 2300 < f <= 3500]

        if f1_cands:
            formants["F1"] = float(f1_cands[0])
        if f2_cands:
            formants["F2"] = float(f2_cands[0])
        if f3_cands:
            formants["F3"] = float(f3_cands[0])

        return formants
