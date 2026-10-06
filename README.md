# VOXSHIELD LIVE

<div align="center">

```
  __      __   ____    __  __   _____   _    _   _____   ______   _        _____  
  \ \    / /  / __ \   \ \/ /  / ____| | |  | | |_   _| |  ____| | |      |  __ \ 
   \ \  / /  | |  | |   \  /  | (___   | |__| |   | |   | |__    | |      | |  | |
    \ \/ /   | |  | |   /  \   \___ \  |  __  |   | |   |  __|   | |      | |  | |
     \  /    | |__| |  / /\ \  ____) | | |  | |  _| |_  | |____  | |____  | |__| |
      \/      \____/  /_/  \_\ |_____/  |_|  |_| |_____| |______| |______| |_____/ 
```

### *"Your call is live. So is your protection."*

**Real-Time Autonomous AI Voice-Clone & Social-Engineering Defense Platform**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Real--Time%20Media-red.svg)](https://webrtc.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 🛡️ Executive Summary

**VOXSHIELD LIVE** is a full-stack, enterprise-grade cybersecurity platform engineered to protect individuals, executives, and financial institutions from real-time generative AI voice clones, deepfake video streams, and coercive social engineering attacks during live phone and video calls.

Unlike traditional post-call forensics tools, VoxShield performs **continuous multi-signal streaming inference** across short audio/video windows (2–3 seconds), providing instantaneous protection and explainable forensic decisions *before* fraudulent transfers or credential theft can occur.

---

## 🌟 The 18 Independent Signal Detection Layers

| # | Detection Layer | Implementation & Acoustic / Computer Vision Metrics |
|:---:|:---|:---|
| **1** | **Real-Time Voice Clone Detection** | Extracts sub-biological micro-jitter ($<0.25\%$), unnatural pitch stability, vocoder noise floor, and elevated high-band spectral flatness. |
| **2** | **Speaker Verification** | Cosine similarity scoring over privacy-preserving 128-dimensional acoustic embedding vectors against enrolled profiles. |
| **3** | **Live Webcam Face Verification** | Facial landmark geometry, texture gradient variance, and boundary distortion detection. |
| **4** | **Lip-Sync Detection** | Audio-visual phoneme-to-mouth aspect ratio (MAR) cross-correlation and temporal offset tracking ($ms$). |
| **5** | **Replay Attack Detection** | Transducer high-frequency rolloff, acoustic comb filtering, and room reverberation anomalies. |
| **6** | **Dynamic Challenge-Response** | Cryptographically unpredictable vocal challenge phrases (e.g., *"Blue Falcon 742"*) that trip real-time generative TTS models. |
| **7** | **Voice + Face Fusion Analysis** | Weighted multi-modal risk synthesis across independent acoustic and visual signals. |
| **8** | **AI Audio Forensics Workbench** | SOC-grade dashboard featuring 64-band Mel spectrogram heatmaps, 13 MFCCs, pitch contours, and formants ($F_1, F_2, F_3$). |
| **9** | **Real-Time Fraud Risk Score** | Dynamically updated 0–100 threat index: **Low** (0–29), **Medium** (30–59), **High** (60–79), and **Critical** (80–100). |
| **10** | **Scam Intent NLP** | Real-time classification of OTP solicitations, artificial urgency, financial coercion, and authority impersonation. |
| **11** | **Graduated Fraud Alerts** | 4-tier alert system with actionable, non-panicking defense instructions. |
| **12** | **Voice Authenticity Timeline** | Chronological audit trail linking temporal risk spikes directly to stored forensic evidence anchors. |
| **13** | **Emotion & Voice Consistency** | Acoustic urgency vs. visual facial affect consistency evaluation. |
| **14** | **Live Conversation Transcription** | Streaming speech-to-text with highlighted threat categories and keyword extraction. |
| **15** | **Explainable AI Reasoning** | Natural language reasoning detailing *why* an alert triggered (e.g., *Vocoder artifact detected + OTP requested*). |
| **16** | **Forensic PDF Report Generation** | Court-admissible ReportLab PDF dossiers containing cryptographic SHA-256 evidence integrity hashes. |
| **17** | **Privacy-Preserving Architecture** | Zero-raw-media persistent storage guarantee, ephemeral sliding buffers, and one-click GDPR purge. |
| **18** | **Multi-Layer Fraud Engine** | Central orchestrator handling confidence-weighted scoring, adaptive friction, and out-of-band verification. |

---

## 🏛️ System Architecture

```text
Caller Browser / WhatsApp / Telephony
               |
               | WebRTC (Opus 16kHz)
               v
      Real-Time Call Server (FastAPI + aiortc)
               |
      +--------+------------------------+
      |                                 |
      v                                 v
Audio Processing Pipeline        Video Processing Pipeline
  - Voice Clone Detector           - Face Authenticity Tracker
  - Speaker Biometric Match        - MAR Lip-Sync Detector
  - Replay Attack Filter           - Facial Affect & Emotion
  - Audio Forensics (STFT/MFCC)
  - Scam Intent Classifier
      |                                 |
      +----------------+----------------+
                       |
                       v
            Multi-Layer Risk Fusion Engine
                       |
                       v
         Explainable AI Decision Engine
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
      SAFE           VERIFY       HIGH RISK
   (Continuous)    (Challenge)        |
                                      v
                               CRITICAL ALERT
                                      v
                             SOC INCIDENT DOSSIER
```

---

## 📱 Connecting WhatsApp Live Calls to VoxShield

Because WhatsApp encrypts calls end-to-end and operating systems sandbox apps, VoxShield provides two dedicated connection methods:

### Method 1: WhatsApp Web (Direct Tab Audio Capture — Zero Setup) ⭐
1. Open **[web.whatsapp.com](https://web.whatsapp.com)** in your browser and start or answer your call.
2. In VoxShield (`http://localhost:3000/call`), click **"Capture WhatsApp Web Tab"**.
3. Select your WhatsApp tab and ensure **"Also share tab audio"** is checked.
4. VoxShield will immediately intercept the live caller stream and display the green VU meter in real time!

### Method 2: WhatsApp Mac App (via Virtual Audio Driver)
1. Install BlackHole: `brew install blackhole-2ch`
2. In macOS **Audio MIDI Setup**, create a **Multi-Output Device** with both your headphones and BlackHole 2ch.
3. In macOS **Control Center → Sound**, set output to your **Multi-Output Device**.
4. In VoxShield's **Audio Input dropdown**, select **"BlackHole 2ch"**.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.14 on macOS Apple Silicon & Linux)
- **Node.js**: 18+ and npm

### 1. Backend Service (Port `8000`)
```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run full test suite (9/9 tests)
pytest app/tests/test_voxshield.py -v

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Endpoint:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Frontend Application (Port `3000`)
```bash
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server (or npm run dev for hot-reloading)
npm run dev
```
* **Mission Control & Landing:** [http://localhost:3000](http://localhost:3000)
* **Live Call Screen:** [http://localhost:3000/call](http://localhost:3000/call)
* **Forensics SOC Workbench:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
* **Speaker Biometric Enrollment:** [http://localhost:3000/verify](http://localhost:3000/verify)
* **Incident Cases & PDF Reports:** [http://localhost:3000/cases](http://localhost:3000/cases)

---

## 🐳 Docker Deployment

Run the complete multi-container stack with a single command:

```bash
docker compose up --build
```

Services will be available at:
* **Frontend:** `http://localhost:3000`
* **Backend:** `http://localhost:8000`

---

## 🧪 Automated Test Suite

Run the backend verification suite to validate all 18 signal layers:

```bash
cd backend
source venv/bin/activate
pytest app/tests/test_voxshield.py -v
```

All 9 test suites verify:
* `AudioProcessor`: STFT, 64-channel Mel filterbank, and 13-coefficient MFCC extraction
* `VoiceCloneDetector`: Synthetic probability and sub-biological jitter detection
* `SpeakerVerificationService`: 128-d acoustic vector cosine similarity
* `ReplayDetector`: Transducer acoustic rolloff and comb filter detection
* `ScamIntentDetector`: Multi-category NLP urgency and coercion identification
* `LipSyncDetector`: Audio-visual cross-modal synchronization
* `DynamicChallengeService`: Unpredictable challenge phrase generation and verification
* `MultiLayerRiskEngine`: Non-linear score fusion and explainable factor attribution
* `Reports & Cases API`: Incident case generation and cryptographic ReportLab PDF rendering

---

## 📂 Project Structure

```text
voxshield-live/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Routers (Calls, Cases, Reports, Verification)
│   │   ├── models/          # SQLAlchemy Database Models (AuditLog, Call, Signals)
│   │   ├── schemas/         # Pydantic V2 Schemas
│   │   ├── services/        # 18 Forensic Signal Detection Engines
│   │   ├── websocket/       # Real-Time WebSocket Telemetry Orchestrator
│   │   ├── config.py        # Centralized App Configuration
│   │   ├── database.py      # SQLite / PostgreSQL Connection Pool
│   │   └── main.py          # FastAPI Application Entrypoint
│   ├── requirements.txt     # Python Dependencies
│   └── Dockerfile
├── frontend/
│   ├── app/                 # Next.js 14 App Router Pages
│   │   ├── call/            # Real-Time Call Monitor & Audio Visualizer
│   │   ├── cases/           # SOC Incident Investigation Dossiers
│   │   ├── dashboard/       # Audio Forensics Workbench & Mel Heatmaps
│   │   ├── reports/         # Court-Admissible PDF Viewer & Exporter
│   │   ├── settings/        # GDPR Data Purge & Privacy Controls
│   │   └── verify/          # Voiceprint Biometric Enrollment
│   ├── components/          # Reusable UI & Gauge Components
│   ├── lib/                 # Audio Encoders, WebRTC, & Utility Helpers
│   └── types/               # TypeScript Interface Definitions
├── ml/                      # ML Inference & Benchmark Notebooks
├── shared/                  # JSON Schemas & Event Definitions
├── docker-compose.yml       # Production Multi-Container Compose
└── ARCHITECTURE.md          # In-Depth Telecommunications Architecture Spec
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
