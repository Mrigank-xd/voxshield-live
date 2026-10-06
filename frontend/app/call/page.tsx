"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RiskUpdate,
  VoiceCloneData,
  SpeakerVerifyData,
  VideoAnalysisData,
  ReplayData,
  ForensicData,
  TranscriptUtterance,
  FraudTimelineEvent,
  DynamicChallenge,
  CallSession,
} from "@/types";
import { RiskMeter } from "@/components/risk-meter/risk-meter";
import { AlertBanner } from "@/components/alerts/alert-banner";
import { VoiceGauge } from "@/components/voice-analysis/voice-gauge";
import { SpeakerCard } from "@/components/verification/speaker-card";
import { FaceCard } from "@/components/face-analysis/face-card";
import { LipSyncMeter } from "@/components/lip-sync/lip-sync-meter";
import { ReplayCard } from "@/components/replay-detection/replay-card";
import { ChallengeWidget } from "@/components/challenge-response/challenge-widget";
import { TranscriptViewer } from "@/components/transcript/transcript-viewer";
import { FraudTimeline } from "@/components/fraud-timeline/fraud-timeline";
import { ExplainablePanel } from "@/components/risk-meter/explainable-panel";
import { LiveCallStream } from "@/components/live-call/live-call-stream";
import { PhoneCall, Shield, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";

export default function LiveCallPage() {
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Real-Time Signal States
  const [riskData, setRiskData] = useState<RiskUpdate>({
    overall_risk_score: 12,
    risk_level: "LOW",
    confidence: 0.88,
    graduated_alert_level: "SILENT_MONITORING",
    alert_message: null,
    recommended_action: "Silent monitoring. No anomalous indicators detected.",
    explanations: ["+ Vocal dynamics and conversation flow match natural human baseline"],
    signal_contributions: {
      voice_authenticity: 0.92,
      voice_clone_probability: 0.08,
      speaker_match_score: 0.94,
      face_authenticity: 0.95,
      lip_sync_score: 0.92,
      replay_probability: 0.05,
      scam_intent_score: 0.0,
    },
  });

  const [voiceClone, setVoiceClone] = useState<VoiceCloneData>({
    synthetic_probability: 0.08,
    natural_probability: 0.92,
    confidence: 0.91,
    timestamp: 0.0,
    audio_quality: 0.88,
    jitter: 0.012,
    shimmer: 0.028,
    spectral_flatness: 0.0124,
    pitch_mean: 142.5,
    anomalies: [],
    model_version: "VoxShield-AudioForensic-v2.4",
  });

  const [speakerVerify, setSpeakerVerify] = useState<SpeakerVerifyData>({
    speaker_match_score: 0.94,
    claimed_identity: "Authorized Caller",
    verification_status: "VERIFIED",
    message: "Acoustic embedding matches enrolled profile with 94% similarity.",
  });

  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysisData>({
    face_authenticity_score: 0.95,
    face_match_score: 0.92,
    lip_sync_score: 0.94,
    emotion_detected: "Attentive / Neutral",
    audio_visual_offset_ms: 12.0,
  });

  const [replayData, setReplayData] = useState<ReplayData>({
    replay_probability: 0.06,
    confidence: 0.85,
    indicators: [],
  });

  const [challenge, setChallenge] = useState<DynamicChallenge | null>(null);
  const [utterances, setUtterances] = useState<TranscriptUtterance[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<FraudTimelineEvent[]>([]);

  // 1. Initialize Call Session
  useEffect(() => {
    async function initCall() {
      try {
        const res = await fetch("http://localhost:8000/api/calls/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caller_name: "Incoming Live Caller",
            caller_number: "+1 (800) 432-1000",
            call_type: "video",
            provider: "webrtc",
          }),
        });
        if (res.ok) {
          const data: CallSession = await res.json();
          setCallSession(data);
          connectWebSocket(data.id);
        }
      } catch (err) {
        console.warn("Backend not reached on default port; initializing standalone session:", err);
        const fallbackCall: CallSession = {
          id: "local-live-call-" + Date.now(),
          session_token: "token-" + Date.now(),
          caller_name: "Incoming Live Caller",
          caller_number: "+1 (800) 432-1000",
          call_type: "video",
          status: "active",
          provider: "webrtc",
          consent_given: true,
          privacy_mode: false,
          created_at: new Date().toISOString(),
          duration_seconds: 0,
          overall_risk_score: 12,
          risk_level: "LOW",
          confidence: 0.88,
          voice_clone_score: 0.08,
          speaker_match_score: 0.94,
          face_authenticity_score: 0.95,
          face_match_score: 0.92,
          lip_sync_score: 0.94,
          replay_score: 0.06,
          scam_intent_score: 0.0,
          challenge_status: "NOT_TRIGGERED",
          recommended_action: "Silent continuous monitoring. No anomalous indicators detected.",
          explanation_reasons: ["+ Vocal dynamics and conversation flow match natural human baseline"],
        };
        setCallSession(fallbackCall);
      }
    }

    initCall();

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // 2. Connect WebSocket
  const connectWebSocket = (callId: string) => {
    try {
      const wsUrl = `ws://localhost:8000/ws/call/${callId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "telemetry_update") {
            if (msg.risk) setRiskData(msg.risk);
            if (msg.voice_clone) setVoiceClone(msg.voice_clone);
            if (msg.speaker_verification) setSpeakerVerify(msg.speaker_verification);
            if (msg.replay_detection) setReplayData(msg.replay_detection);
          } else if (msg.type === "video_analysis_update") {
            setVideoAnalysis({
              face_authenticity_score: msg.face_authenticity_score,
              face_match_score: msg.face_match_score,
              lip_sync_score: msg.lip_sync_score,
              emotion_detected: msg.emotion_detected,
            });
          } else if (msg.type === "transcript_update") {
            const newUtt: TranscriptUtterance = {
              id: "utt-" + Date.now(),
              timestamp: msg.timestamp || 0,
              formatted_time: formatTime(msg.timestamp || 0),
              speaker_role: msg.speaker_role || "caller",
              text: msg.text,
              scam_intent_score: msg.scam_intent?.scam_intent_score || 0,
              detected_categories: msg.scam_intent?.detected_categories || [],
              highlighted_phrases: msg.scam_intent?.highlighted_phrases || [],
            };
            setUtterances((prev) => [...prev, newUtt]);
            if (msg.risk) setRiskData(msg.risk);
          } else if (msg.type === "challenge_triggered") {
            setChallenge(msg.challenge);
          } else if (msg.type === "challenge_result") {
            setChallenge((prev) =>
              prev ? { ...prev, status: msg.result?.status || "VERIFIED" } : null
            );
          } else if (msg.type === "simulation_tick") {
            // Comprehensive scenario simulation packet
            if (msg.risk) setRiskData(msg.risk);
            if (msg.voice_clone) setVoiceClone(msg.voice_clone);
            if (msg.speaker_verification) setSpeakerVerify(msg.speaker_verification);
            if (msg.video_analysis) setVideoAnalysis(msg.video_analysis);
            if (msg.replay_detection) setReplayData(msg.replay_detection);

            // Add transcript utterance
            const newUtt: TranscriptUtterance = {
              id: "utt-" + Date.now(),
              timestamp: msg.timestamp,
              formatted_time: formatTime(msg.timestamp),
              speaker_role: msg.speaker_role || "caller",
              text: msg.text,
              scam_intent_score: msg.scam_intent?.scam_intent_score || 0,
              detected_categories: msg.scam_intent?.detected_categories || [],
              highlighted_phrases: msg.scam_intent?.highlighted_phrases || [],
            };
            setUtterances((prev) => [...prev, newUtt]);

            // Add timeline event if present
            if (msg.event) {
              const newEv: FraudTimelineEvent = {
                id: "ev-" + Date.now(),
                timestamp: msg.timestamp,
                formatted_time: formatTime(msg.timestamp),
                event_type: msg.event.type,
                severity: msg.event.severity,
                title: msg.event.title,
                description: msg.event.desc,
              };
              setTimelineEvents((prev) => [...prev, newEv]);
            }
          }
        } catch (e) {
          console.error("Failed to parse WebSocket event:", e);
        }
      };

      ws.onclose = () => setIsConnected(false);
      wsRef.current = ws;
    } catch (err) {
      console.warn("WebSocket initialization error:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Trigger Scenario in Backend Simulator
  const handleTriggerScenario = (scenario: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "simulate_scenario",
          scenario: scenario,
        })
      );
    } else {
      // Local fallback simulation if offline
      runOfflineScenario(scenario);
    }
  };

  // Dispatch Live Microphone / Tab Audio Chunks to Backend
  const handleSendAudioChunk = (base64Wav: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "audio_chunk",
          data: base64Wav,
          timestamp: callDuration,
        })
      );
    }
  };

  // Offline Simulation Fallback for testing standalone
  const runOfflineScenario = (scenario: string) => {
    const isScam = scenario !== "legitimate_call";
    const ts = callDuration + 5;
    const text = isScam
      ? "Your bank account has an unauthorized wire of ₹85,000. Read out the OTP immediately or your account will be blocked!"
      : "Hi, just checking in to confirm the team sync at 3 PM today.";

    const newUtt: TranscriptUtterance = {
      id: "utt-" + Date.now(),
      timestamp: ts,
      formatted_time: formatTime(ts),
      speaker_role: "caller",
      text,
      scam_intent_score: isScam ? 92.0 : 0.0,
      detected_categories: isScam
        ? ["OTP_REQUEST", "URGENCY_COERCION", "ACCOUNT_SUSPENSION_THREAT", "MONEY_TRANSFER"]
        : [],
      highlighted_phrases: isScam
        ? [{ phrase: "OTP immediately", category: "OTP_REQUEST", label: "OTP Solicitation" }]
        : [],
    };
    setUtterances((prev) => [...prev, newUtt]);

    if (isScam) {
      setRiskData({
        overall_risk_score: 88,
        risk_level: "CRITICAL",
        confidence: 0.94,
        graduated_alert_level: "CRITICAL_INTERVENTION",
        alert_message: "CRITICAL ALERT: Caller is soliciting a one-time password with coercive account freeze threats.",
        recommended_action: "Require independent out-of-band verification before sharing credentials or funds.",
        explanations: [
          "+ Synthetic speech indicators detected (sub-biological micro-jitter / vocoder artifact)",
          "+ Caller requested one-time passcode (OTP) or security credential",
          "+ Unusual psychological urgency and coercive threat patterns detected",
          "+ Speaker does not strongly match trusted biometric profile",
        ],
        signal_contributions: {
          voice_authenticity: 0.12,
          voice_clone_probability: 0.88,
          speaker_match_score: 0.28,
          face_authenticity: 0.72,
          lip_sync_score: 0.35,
          replay_probability: 0.22,
          scam_intent_score: 92.0,
        },
      });

      setVoiceClone((prev) => ({
        ...prev,
        synthetic_probability: 0.88,
        natural_probability: 0.12,
        anomalies: [
          "Sub-biological jitter: Unnaturally stable pitch period (<0.25% perturbation)",
          "Vocoder noise floor: Elevated spectral flatness in upper frequency bands",
        ],
      }));

      setTimelineEvents((prev) => [
        ...prev,
        {
          id: "ev-" + Date.now(),
          timestamp: ts,
          formatted_time: formatTime(ts),
          event_type: "CRITICAL_FRAUD",
          severity: "CRITICAL",
          title: "Critical OTP Solicitation Attempt",
          description: "Caller demanded 6-digit one-time passcode with account suspension coercion.",
        },
      ]);
    }
  };

  // Generate Challenge
  const handleGenerateChallenge = async () => {
    if (callSession) {
      try {
        const res = await fetch("http://localhost:8000/api/verification/challenge/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ call_id: callSession.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setChallenge(data);
          return;
        }
      } catch (err) {}
    }

    // Fallback random generation
    const adjectives = ["Blue", "Silver", "Copper", "Emerald", "Solar", "Crimson"];
    const nouns = ["Falcon", "Horizon", "Beacon", "Summit", "Matrix", "Vanguard"];
    const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randNum = Math.floor(Math.random() * 900) + 100;
    const phrase = `${randAdj} ${randNoun} ${randNum}`;

    setChallenge({
      challenge_phrase: phrase,
      prompt_text: `Please say: '${phrase}'`,
      expected_keywords: [randAdj.toLowerCase(), randNoun.toLowerCase(), String(randNum)],
      issued_at: Date.now(),
      status: "PENDING",
    });
  };

  // Verify Spoken Response
  const handleVerifyResponse = async (spokenText: string) => {
    if (!challenge) return;

    if (callSession) {
      try {
        const res = await fetch("http://localhost:8000/api/verification/challenge/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            call_id: callSession.id,
            challenge_phrase: challenge.challenge_phrase,
            spoken_phrase: spokenText,
          }),
        });
        if (res.ok) {
          const result = await res.json();
          setChallenge((prev) => (prev ? { ...prev, status: result.status } : null));
          return;
        }
      } catch (err) {}
    }

    // Fallback evaluation
    const isCorrect = spokenText.toLowerCase().includes(challenge.expected_keywords[0]);
    setChallenge((prev) => (prev ? { ...prev, status: isCorrect ? "VERIFIED" : "FAILED" } : null));
  };

  const handleEndCall = async () => {
    if (callSession) {
      try {
        await fetch(`http://localhost:8000/api/calls/${callSession.id}/end`, {
          method: "POST",
        });
      } catch (e) {}
    }
    window.location.href = "/cases";
  };

  return (
    <div className="space-y-6 py-2">
      {/* Top Real-Time Alert Banner */}
      <AlertBanner
        score={riskData.overall_risk_score}
        level={riskData.risk_level}
        alertMessage={riskData.alert_message}
        recommendedAction={riskData.recommended_action}
        detectedCategories={utterances.flatMap((u) => u.detected_categories)}
        onTriggerVerify={handleGenerateChallenge}
      />

      {/* Primary Calling & Risk Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Video/Audio Call Canvas & Stream (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <LiveCallStream
            callId={callSession?.id || "session-live"}
            callerName={callSession?.caller_name || "Suspected Impersonator"}
            callerNumber={callSession?.caller_number || "+1 (800) 432-1000"}
            callType={callSession?.call_type || "video"}
            status={callSession?.status || "active"}
            durationSeconds={callDuration}
            overallRiskScore={riskData.overall_risk_score}
            onEndCall={handleEndCall}
            onTriggerScenario={handleTriggerScenario}
            onSendAudioChunk={handleSendAudioChunk}
          />

          {/* Dynamic Liveness Challenge Widget */}
          <ChallengeWidget
            challenge={challenge}
            onGenerateChallenge={handleGenerateChallenge}
            onVerifyResponse={handleVerifyResponse}
          />

          {/* Live Conversation Transcript */}
          <TranscriptViewer utterances={utterances} />
        </div>

        {/* Right Column: Multi-Modal Detection Gauges & Explainable AI (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Central Real-Time Risk Meter */}
          <RiskMeter
            score={riskData.overall_risk_score}
            level={riskData.risk_level}
            confidence={riskData.confidence}
          />

          {/* Explainable AI Decision Breakdown */}
          <ExplainablePanel
            score={riskData.overall_risk_score}
            confidence={riskData.confidence}
            explanations={riskData.explanations}
            recommendedAction={riskData.recommended_action}
          />

          {/* Signal Sub-Gauges Grid */}
          <div className="space-y-4">
            <VoiceGauge data={voiceClone} />
            <SpeakerCard data={speakerVerify} />
            <FaceCard data={videoAnalysis} videoEnabled={callSession?.call_type === "video"} />
            <LipSyncMeter
              score={videoAnalysis.lip_sync_score}
              offsetMs={videoAnalysis.audio_visual_offset_ms}
            />
            <ReplayCard data={replayData} />
          </div>

          {/* Voice Authenticity Timeline */}
          <FraudTimeline
            events={timelineEvents}
            callDurationSeconds={callDuration}
          />
        </div>
      </div>
    </div>
  );
}
