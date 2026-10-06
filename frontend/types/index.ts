export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface RiskUpdate {
  overall_risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  graduated_alert_level: string;
  alert_message: string | null;
  recommended_action: string;
  explanations: string[];
  signal_contributions: {
    voice_authenticity: number;
    voice_clone_probability: number;
    speaker_match_score: number;
    face_authenticity: number;
    lip_sync_score: number;
    replay_probability: number;
    scam_intent_score: number;
  };
}

export interface VoiceCloneData {
  synthetic_probability: number;
  natural_probability: number;
  confidence: number;
  timestamp: number;
  audio_quality: number;
  spectral_flatness?: number;
  pitch_mean?: number;
  pitch_std?: number;
  jitter?: number;
  shimmer?: number;
  formant_dispersion?: number;
  anomalies?: string[];
  model_version?: string;
}

export interface SpeakerVerifyData {
  speaker_match_score: number;
  speaker_confidence?: number;
  claimed_identity?: string;
  verification_status: "VERIFIED" | "UNCERTAIN" | "MISMATCH" | "NO_ENROLLED_PROFILE";
  message: string;
}

export interface VideoAnalysisData {
  face_authenticity_score: number;
  face_match_score: number;
  lip_sync_score: number;
  emotion_detected: string;
  audio_visual_offset_ms?: number;
}

export interface ReplayData {
  replay_probability: number;
  confidence: number;
  indicators?: string[];
}

export interface ForensicData {
  timestamp: number;
  duration_s: number;
  waveform_sample: number[];
  mel_spectrogram: number[][];
  mfcc_features: number[];
  pitch_contour: number[];
  pitch_mean: number;
  pitch_std: number;
  jitter: number;
  shimmer: number;
  energy_envelope: number[];
  spectral_centroid: number;
  spectral_rolloff: number;
  spectral_flatness: number;
  zero_crossing_rate: number;
  formants: {
    F1: number;
    F2: number;
    F3: number;
  };
  anomalies: string[];
}

export interface TranscriptUtterance {
  id: string;
  timestamp: number;
  formatted_time: string;
  speaker_role: "caller" | "user" | "agent";
  text: string;
  scam_intent_score: number;
  detected_categories: string[];
  highlighted_phrases: Array<{
    phrase: string;
    category: string;
    label: string;
  }>;
}

export interface FraudTimelineEvent {
  id: string;
  timestamp: number;
  formatted_time: string;
  event_type: string;
  severity: RiskLevel;
  title: string;
  description: string;
  evidence_data?: any;
}

export interface DynamicChallenge {
  challenge_phrase: string;
  prompt_text: string;
  expected_keywords: string[];
  issued_at: number;
  status: "PENDING" | "VERIFIED" | "FAILED" | "SUSPICIOUS";
}

export interface CallSession {
  id: string;
  session_token: string;
  caller_name: string;
  caller_number: string;
  call_type: "audio" | "video";
  status: "active" | "completed" | "terminated";
  provider: "webrtc" | "mock" | "sip";
  consent_given: boolean;
  privacy_mode: boolean;
  created_at: string;
  duration_seconds: number;
  overall_risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  voice_clone_score: number;
  speaker_match_score: number;
  face_authenticity_score: number;
  face_match_score: number;
  lip_sync_score: number;
  replay_score: number;
  scam_intent_score: number;
  challenge_status: string;
  active_challenge_phrase?: string;
  recommended_action: string;
  explanation_reasons: string[];
}

export interface CaseRecord {
  id: string;
  case_number: string;
  call_id: string;
  created_at: string;
  updated_at: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "DISMISSED";
  risk_score: number;
  risk_level: RiskLevel;
  investigator_notes: string;
  recommended_action: string;
  report_generated: boolean;
  report_path?: string;
}

export interface TrustedSpeaker {
  id: number;
  name: string;
  role_or_relationship: string;
  phone_number?: string;
  voice_sample_hash: string;
  registered_at: string;
  active: boolean;
  notes: string;
}
