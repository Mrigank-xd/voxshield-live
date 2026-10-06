"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  Mic,
  Video,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { AudioForensicsView } from "@/components/forensic-report/audio-forensics-view";
import { ForensicData, CallSession } from "@/types";
import { cn, getRiskColor } from "@/lib/utils";

export default function DashboardPage() {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [forensicData, setForensicData] = useState<ForensicData>({
    timestamp: 45.2,
    duration_s: 3.0,
    waveform_sample: Array.from({ length: 100 }, (_, i) => Math.sin(i / 3) * Math.cos(i / 5) * 0.4),
    mel_spectrogram: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) => (Math.sin(r + c) * 30 + 50))
    ),
    mfcc_features: [12.4, -4.2, 8.1, -1.5, 3.2, 0.4, -2.1, 1.8, 0.2, -1.1, 0.9, -0.4, 0.1],
    pitch_contour: [142, 144, 143, 145, 142, 140, 141, 143, 142, 141, 144, 146, 142, 141, 140, 142, 143, 144, 142, 141],
    pitch_mean: 142.4,
    pitch_std: 4.8, // Abnormal low std typical of vocoders
    jitter: 0.0021, // Sub-biological
    shimmer: 0.024,
    energy_envelope: [15, 20, 35, 42, 50, 48, 42, 38, 30, 25, 20, 18, 22, 28, 32, 30, 24, 18, 14, 12],
    spectral_centroid: 2450.0,
    spectral_rolloff: 4800.0,
    spectral_flatness: 0.064,
    zero_crossing_rate: 0.082,
    formants: { F1: 520.0, F2: 1540.0, F3: 2610.0 },
    anomalies: [
      "Sub-biological micro-jitter (<0.25% vocal cord perturbation)",
      "High-frequency vocoder noise floor elevation",
      "Flattened prosodic pitch standard deviation",
    ],
  });

  useEffect(() => {
    async function loadCalls() {
      try {
        const res = await fetch("http://localhost:8000/api/calls/");
        if (res.ok) {
          const data = await res.json();
          setCalls(data);
        }
      } catch (e) {
        // Fallback demo list
        setCalls([
          {
            id: "call-demo-1",
            session_token: "tok-1",
            caller_name: "Suspected Impersonator (Bank Security)",
            caller_number: "+1 (800) 432-1000",
            call_type: "video",
            status: "completed",
            provider: "webrtc",
            consent_given: true,
            privacy_mode: false,
            created_at: new Date().toISOString(),
            duration_seconds: 165,
            overall_risk_score: 87,
            risk_level: "CRITICAL",
            confidence: 0.92,
            voice_clone_score: 0.88,
            speaker_match_score: 0.24,
            face_authenticity_score: 0.74,
            face_match_score: 0.68,
            lip_sync_score: 0.34,
            replay_score: 0.19,
            scam_intent_score: 91.0,
            challenge_status: "FAILED",
            recommended_action: "Require independent out-of-band verification before fund release.",
            explanation_reasons: ["+ Synthetic voice clone markers detected", "+ OTP solicitation attempt"],
          },
        ]);
      }
    }
    loadCalls();
  }, []);

  return (
    <div className="space-y-8 py-2">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              SECURITY OPERATIONS CENTER (SOC)
            </h1>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
              LIVE MONITORING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time AI Audio Forensics, Cross-Modal Discrepancy & Fraud Telemetry
          </p>
        </div>

        <Link
          href="/call"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-cyan-600/20 transition-all self-start sm:self-auto"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Launch Monitored Call</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Calls Monitored</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2">1,248</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs last week
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Clones Intercepted</span>
            <Mic className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black font-mono text-red-400 mt-2">84</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">
            Neural vocoders identified
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Deepfakes Flagged</span>
            <Video className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black font-mono text-purple-400 mt-2">32</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">
            Lip-sync & face reenactments
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Detection Latency</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-2">&lt; 140ms</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">
            Real-time continuous inference
          </div>
        </div>
      </div>

      {/* Feature 8: Deep Acoustic Forensics Inspection Workbench */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight">
            DEEP ACOUSTIC FORENSIC INSPECTION WORKBENCH
          </h2>
          <span className="text-xs text-slate-400">
            Click suspicious segments to inspect vocal cord micro-perturbations
          </span>
        </div>
        <AudioForensicsView data={forensicData} />
      </div>

      {/* Recent Monitored Calls Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight">
            RECENT TELEPHONY SESSIONS & THREATS
          </h2>
          <Link href="/cases" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
            <span>View All Investigation Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-3 px-4">Caller Identity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Voice Clone</th>
                  <th className="py-3 px-4">Lip-Sync</th>
                  <th className="py-3 px-4">Dynamic Challenge</th>
                  <th className="py-3 px-4 text-right">Forensic Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {calls.map((call) => {
                  const riskStyles = getRiskColor(call.overall_risk_score);
                  return (
                    <tr key={call.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-semibold text-white">
                        <div>{call.caller_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{call.caller_number}</div>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] text-slate-300 font-semibold">
                        {call.call_type}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[11px] font-bold border",
                            riskStyles.badge
                          )}
                        >
                          {call.overall_risk_score}/100 ({call.risk_level})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={call.voice_clone_score > 0.6 ? "text-red-400 font-bold" : "text-emerald-400"}>
                          {Math.round(call.voice_clone_score * 100)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={call.lip_sync_score < 0.6 ? "text-red-400 font-bold" : "text-emerald-400"}>
                          {Math.round(call.lip_sync_score * 100)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold border",
                            call.challenge_status === "VERIFIED"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : call.challenge_status === "FAILED"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          )}
                        >
                          {call.challenge_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <Link
                          href={`/cases/${call.id}`}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 transition-all inline-block"
                        >
                          Inspect Case
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
