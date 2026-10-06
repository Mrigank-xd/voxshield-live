# VOXSHIELD LIVE — TECHNICAL ARCHITECTURE SPECIFICATION

> **"Your call is live. So is your protection."**

VOXSHIELD LIVE is an autonomous, multi-modal, real-time AI voice-clone and social engineering detection platform engineered for live voice and video calls.

---

## 1. High-Level Telephony & Media Architecture

```
Caller Browser / Device
      │
      │ WebRTC (Opus Audio 16 kHz / VP8-H.264 Video)
      ▼
Real-Time Call Server (FastAPI + aiortc + WebSockets)
      │
      ├─────────────────────────────────────────┐
      │                                         │
      ▼                                         ▼
Audio Processing Pipeline                 Video Processing Pipeline
(STFT, Mel Spectrogram, MFCC, Pitch)      (OpenCV Face Landmark Mesh, MAR)
      │                                         │
      ├───────────────────────┐                 ├──────────────────────┐
      ▼                       ▼                 ▼                      ▼
Voice Clone Detector     Speaker Verify    Face Authenticity      Lip-Sync Timing
(Micro-Jitter/Flatness)  (128-d Cosine)    (Deepfake Denoise)     (A/V Cross-Corr)
      │                       │                 │                      │
      ├───────────────────────┘                 ├──────────────────────┘
      ▼                                         ▼
Replay Attack Detector                    Emotion Consistency
(Comb Filtering/Room IR)                  (Prosody vs Facial Demeanor)
      │                                         │
      ├─────────────────────────────────────────┘
      │
      ▼
Scam Intent NLP Engine
(OTP Solicitations, Urgency Coercion, Authority Pretexting, Financial Requests)
      │
      ▼
MULTIMODAL FUSION ENGINE
(Configurable Weights: Voice 25%, Scam 25%, Speaker 15%, LipSync 15%, Face 10%, Replay 10%)
      │
      ▼
CENTRAL FRAUD RISK ENGINE
(Exponential Moving Evidence Accumulation, Dynamic Liveness Thresholding)
      │
      ▼
EXPLAINABLE AI ENGINE
(Confidence Metrics, Forensic Explanations, Actionable Cybersecurity Guidance)
      │
      ├────────────────────────┬────────────────────────┐
      ▼                        ▼                        ▼
 0–29 LOW                 30–59 MEDIUM             60–79 HIGH / 80–100 CRITICAL
Silent Continuous         Elevated Subtle           Graduated Alert & Mandatory
   Monitoring                Vigilance               Independent Caller Verify
```

---

## 2. Pluggable Call Provider Abstraction

The media layer decouples raw transport protocols from downstream detection engines:

```
CallProvider (Abstract Interface)
    ├── WebRTCCallProvider (Live browser-to-server peer connection via aiortc)
    ├── MockCallProvider (Interactive scenario simulator: Bank Scams, CEO Impersonation)
    └── FutureSIPProvider (Drop-in carrier PBX / SIP Trunking adapter stub)
```

No carrier cellular interception is faked or assumed—browser calls use genuine WebRTC, while external telephony integrates cleanly via SIP trunks.

---

## 3. The 18 Signal Detection Layers

1. **Real-Time Voice Clone Detection**: Evaluates sub-biological vocal cord micro-perturbations ($<0.25\%$ jitter), high-frequency spectral flatness, and vocoder noise floor signatures.
2. **Speaker Verification**: Computes cosine similarity across privacy-preserving 128-dimensional acoustic projection vectors against enrolled authorized profiles.
3. **Live Webcam Face Verification**: OpenCV facial bounding box stabilization, landmark tracking (68 points), and texture gradient Laplacian variance analysis.
4. **Lip-Sync Detection**: Cross-modal Pearson correlation and lag estimation between speech acoustic syllable onsets and mouth aperture (MAR) opening velocity.
5. **Replay Attack Detection**: Detects acoustic comb-filtering, secondary room impulse response decay, and high-frequency loudspeaker transducer rolloff ($>4$ kHz attenuation).
6. **Dynamic Challenge-Response**: Cryptographically unpredictable vocal phrase challenge (e.g., *"Blue Falcon 742"*) triggered automatically when risk exceeds 65/100.
7. **Voice + Face Fusion Analysis**: Weighted synthesis of multi-modal streams to prevent single-signal false alarms.
8. **AI Audio Forensics**: Interactive 100-point oscillogram, 64-band Mel spectrogram heatmap, 13 MFCC coefficients, pitch contour ($F_0$), and formants ($F_1, F_2, F_3$).
9. **Real-Time Fraud Risk Score**: Continuously updated 0–100 composite risk index with exponential evidence smoothing.
10. **Scam Intent NLP**: Rule-based and syntactic regex extraction spanning OTP solicitations, financial urgency, card credentials, remote access applications, and secrecy demands.
11. **Graduated Fraud Alerts**: Non-accusing four-tier warnings (Low, Medium, High, Critical) designed to support victim autonomy without false accusations.
12. **Voice Authenticity Timeline**: Chronological event tracker plotting acoustic anomalies, credential solicitations, and risk elevations with click-to-inspect evidence details.
13. **Emotion & Voice Consistency**: Evaluates congruency between vocal prosodic excitement/agitation and visual facial demeanor as a weak supporting signal.
14. **Live Conversation Transcription**: Streaming timestamped speech utterances with syntactic category highlighting and search filtering.
15. **Explainable AI**: Transparent, natural-language rationale explaining exactly *why* a call is scored as High Risk.
16. **Forensic Report Generation**: Downloadable court-admissible PDF reports rendered via ReportLab with tables, timestamps, and SHA-256 evidence digests.
17. **Zero-Raw-Media Privacy Preservation**: Ephemeral buffer processing guarantee: `Raw Media -> Feature Extraction -> Risk Signal -> Discard Buffer`.
18. **Multi-Layer Fraud Engine**: Central orchestrator coordinating evidence accumulation and out-of-band intervention workflows.

---

## 4. Privacy & Compliance Guarantees (GDPR & Ephemeral Mode)

- **Immediate Buffer Purging**: Raw audio and video frames are processed in-memory and discarded upon feature parameterization.
- **Biometric Non-Invertibility**: Enrolled voice profiles store projected mathematical vectors, preventing audio reconstruction.
- **Right to be Forgotten**: `DELETE /api/cases/{id}/purge` and `DELETE /api/verification/speakers/{id}` completely erase database records and log immutable audit anchors.
