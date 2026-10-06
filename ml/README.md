# VoxShield ML & Acoustic Forensics

VoxShield Live combines real-time acoustic signal processing, deep neural vocoder anomaly detection, and privacy-preserving speaker embeddings.

## Detection Pipeline
1. **Windowing**: 3.0s sliding audio frames with 1.0s hop at 16 kHz mono.
2. **Feature Extraction**:
   - 64-band Mel-Filterbank in dB scale
   - 13 Mel-Frequency Cepstral Coefficients (MFCCs)
   - Fundamental frequency ($F_0$) via autocorrelation
   - Vocal Cord Micro-Perturbations:
     - Jitter (period-to-period relative average perturbation)
     - Shimmer (amplitude variation across voiced cycles)
   - Spectral Moments: Centroid, Rolloff (85%), Flatness (Wiener entropy), Zero Crossing Rate
   - Formant Resonances ($F_1, F_2, F_3$)
3. **Synthetic Speech / Neural Vocoder Signatures**:
   - *Sub-biological micro-jitter*: Biological human vocal tract tissue exhibits natural physical tremor (jitter 0.5% - 2.5%). Diffusion and GAN neural vocoders (e.g. HiFi-GAN, MelGAN) produce rigidly periodic waveforms ($< 0.25\%$).
   - *Spectral flatness anomalies*: Neural vocoders produce elevated high-frequency noise floor or unnatural harmonic comb lines.
   - *Prosody variance collapse*: Cloned voices frequently show standard deviation of pitch $< 7.0$ Hz during connected speech.
4. **Speaker Verification**:
   - 128-dimensional acoustic projection vector.
   - Cosine distance evaluated against privacy-preserved enrolled vector.
   - Raw biometric audio is discarded immediately following projection.
