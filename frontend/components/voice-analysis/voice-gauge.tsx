"use client";

import React from "react";
import { Mic, Waves, AlertCircle, CheckCircle, Info } from "lucide-react";
import { VoiceCloneData } from "@/types";
import { cn } from "@/lib/utils";

interface VoiceGaugeProps {
  data: VoiceCloneData;
  className?: string;
}

export function VoiceGauge({ data, className }: VoiceGaugeProps) {
  const synthPercent = Math.round((data.synthetic_probability || 0) * 100);
  const naturalPercent = 100 - synthPercent;
  const isAnomalous = synthPercent >= 60;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 backdrop-blur-md transition-all",
        isAnomalous
          ? "border-red-500/40 bg-red-950/20"
          : "border-slate-800 bg-slate-900/40",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isAnomalous ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400"
            )}
          >
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              VOICE CLONE DETECTOR
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              {data.model_version || "VoxShield-AudioForensic-v2.4"}
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded font-bold border",
            isAnomalous
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          )}
        >
          {isAnomalous ? "SYNTHETIC LIKELY" : "NATURAL VOCAL TRACT"}
        </span>
      </div>

      {/* Progress Split Bar */}
      <div className="space-y-1.5 my-3">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-emerald-400">Natural: {naturalPercent}%</span>
          <span className="text-red-400">Synthetic Clone: {synthPercent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${naturalPercent}%` }}
          />
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${synthPercent}%` }}
          />
        </div>
      </div>

      {/* Acoustic Perturbations & Spectral Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center my-3">
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Jitter (Perturbation)</div>
          <div className={cn("text-xs font-mono font-bold mt-0.5", (data.jitter || 0) < 0.003 ? "text-red-400" : "text-slate-200")}>
            {((data.jitter || 0) * 100).toFixed(2)}%
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Shimmer (Amplitude)</div>
          <div className="text-xs font-mono font-bold mt-0.5 text-slate-200">
            {((data.shimmer || 0) * 100).toFixed(2)}%
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Spectral Flatness</div>
          <div className={cn("text-xs font-mono font-bold mt-0.5", (data.spectral_flatness || 0) > 0.05 ? "text-red-400" : "text-slate-200")}>
            {(data.spectral_flatness || 0).toFixed(4)}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase">Pitch F0 Mean</div>
          <div className="text-xs font-mono font-bold mt-0.5 text-slate-200">
            {data.pitch_mean ? `${Math.round(data.pitch_mean)} Hz` : "N/A"}
          </div>
        </div>
      </div>

      {/* Anomalies Callout */}
      {data.anomalies && data.anomalies.length > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-xs">
          <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Acoustic Anomalies Observed:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
            {data.anomalies.map((ano, idx) => (
              <li key={idx}>{ano}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
