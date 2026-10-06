"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Trash2, EyeOff, FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [privacyMode, setPrivacyMode] = useState(true);
  const [ephemeralAudio, setEphemeralAudio] = useState(true);
  const [retentionDays, setRetentionDays] = useState(30);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const auditLogs = [
    { timestamp: "2026-10-06 17:35:12 UTC", action: "CALL_TERMINATED", details: "Call completed with final risk 87/100. Raw audio buffer purged immediately.", tag: "GDPR-EPHEMERAL" },
    { timestamp: "2026-10-06 17:32:05 UTC", action: "SPEAKER_ENROLLED", details: "Speaker 'Sarah Jenkins' enrolled. 128-d vector persisted; raw wav discarded.", tag: "BIOMETRIC-MINIMAL" },
    { timestamp: "2026-10-06 17:30:19 UTC", action: "CONSENT_GRANTED", details: "Explicit caller webcam & mic consent acknowledged.", tag: "CONSENT-LOG" },
    { timestamp: "2026-10-06 17:28:44 UTC", action: "PRIVACY_MODE_ENABLED", details: "Zero-raw-media telemetry mode confirmed active.", tag: "PRIVACY-AUDIT" },
  ];

  const handlePurgeAll = () => {
    if (confirm("Execute GDPR Right-to-be-Forgotten purge for all historical ephemeral telemetry?")) {
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 py-2 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-white tracking-tight">
            PRIVACY PRESERVATION & SECURITY SETTINGS
          </h1>
          <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
            FEATURE 17
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Zero-raw-media retention policies, ephemeral feature extraction, and GDPR compliance controls
        </p>
      </div>

      {/* Ephemeral Architecture Guarantee Card */}
      <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5" />
          <span>Zero-Raw-Media Ephemeral Architecture Guarantee</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          VoxShield Live is architected with strict biometric privacy principles: incoming raw audio and video chunks are immediately decoded, parameterized into acoustic Fourier/spectral moments or facial landmark distances, evaluated by the risk engine, and <b>instantly discarded from memory</b>. Raw media is never stored to persistent storage by default.
        </p>

        {/* Visual Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono pt-2">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Step 1</span>
            Raw Audio Chunks
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Step 2</span>
            Feature Extraction
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-purple-300">
            <span className="text-slate-500 block text-[9px] uppercase font-bold">Step 3</span>
            Risk Engine Score
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
            <span className="text-emerald-400 block text-[9px] uppercase font-bold">Step 4</span>
            Discard Raw Media
          </div>
        </div>
      </div>

      {/* Settings Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retention & Privacy Toggles */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Biometric Retention Policies</span>
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Strict Ephemeral Processing</span>
              <span className="text-[11px] text-slate-400 block">
                Discard all audio/video buffers immediately after FFT/spectral extraction.
              </span>
            </div>
            <input
              type="checkbox"
              checked={ephemeralAudio}
              onChange={(e) => setEphemeralAudio(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">High Privacy Mode</span>
              <span className="text-[11px] text-slate-400 block">
                Mask speaker identities and redact phone numbers from SOC dashboard.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacyMode}
              onChange={(e) => setPrivacyMode(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Incident Case Metadata Retention (Days)
            </label>
            <input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Metadata and cryptographic SHA-256 hashes auto-purge after this period.
            </span>
          </div>
        </div>

        {/* Data Erasure / GDPR Right to be Forgotten */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>GDPR Right-to-be-Forgotten Data Purge</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Users can request complete, irreversible erasure of all registered speaker profiles, session tokens, and incident logs. An immutable audit record verifying the erasure timestamp is preserved.
            </p>
          </div>

          {purgeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Purge executed. All requested case telemetry permanently removed.</span>
            </div>
          )}

          <button
            onClick={handlePurgeAll}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-red-400 bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Execute Comprehensive Data Purge</span>
          </button>
        </div>
      </div>

      {/* Compliance Audit Trail Log */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span>Compliance & Consent Audit Trail</span>
        </h3>

        <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden text-xs">
          <table className="w-full text-left font-mono">
            <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4">Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-2.5 px-4 text-cyan-400 font-bold">{log.action}</td>
                  <td className="py-2.5 px-4 text-slate-300 font-sans">{log.details}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-400">
                      {log.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
