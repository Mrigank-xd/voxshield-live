"use client";

import React from "react";
import { Activity, BarChart2, Radio, AlertCircle } from "lucide-react";
import { ForensicData } from "@/types";
import { cn } from "@/lib/utils";

interface AudioForensicsViewProps {
  data: ForensicData;
  className?: string;
}

export function AudioForensicsView({ data, className }: AudioForensicsViewProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-5",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              AI ACOUSTIC FORENSICS WORKBENCH
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Fourier Spectrograms, Pitch Dynamics & Vocal Tract Resonances
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          WINDOW: {data.duration_s || 3.0}s | 16 kHz
        </span>
      </div>

      {/* 1. Waveform Canvas / SVG */}
      <div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
          <span>Time-Domain Oscillogram (Waveform)</span>
          <span className="font-mono text-slate-500">100 SAMPLES</span>
        </div>
        <div className="h-16 w-full bg-slate-950 rounded-xl border border-slate-800/80 p-2 flex items-center justify-between gap-[2px]">
          {data.waveform_sample && data.waveform_sample.length > 0 ? (
            data.waveform_sample.map((val, idx) => {
              const hPercent = Math.min(Math.max(Math.abs(val) * 100 * 2.5, 4), 98);
              return (
                <div
                  key={idx}
                  className="flex-1 bg-cyan-500/80 rounded-full transition-all duration-200 hover:bg-cyan-300"
                  style={{ height: `${hPercent}%` }}
                />
              );
            })
          ) : (
            <div className="w-full text-center text-[10px] text-slate-600">Awaiting audio waveform buffer...</div>
          )}
        </div>
      </div>

      {/* 2. 16x16 Mel Spectrogram Matrix Heatmap */}
      <div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
          <span>Mel-Spectrogram Energy Distribution (Heatmap)</span>
          <span className="font-mono text-slate-500">64 Mel Filterbanks</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
          <div className="grid grid-cols-16 gap-[2px] h-24">
            {data.mel_spectrogram && data.mel_spectrogram.length > 0 ? (
              data.mel_spectrogram.map((row, rIdx) =>
                row.map((val, cIdx) => {
                  // Heatmap coloring: Dark purple -> Teal -> Yellow
                  const intensity = Math.min(Math.max(val / 100, 0), 1);
                  let bgStyle = "#0f172a";
                  if (intensity > 0.8) bgStyle = "#facc15"; // bright yellow
                  else if (intensity > 0.6) bgStyle = "#22d3ee"; // cyan
                  else if (intensity > 0.4) bgStyle = "#0284c7"; // blue
                  else if (intensity > 0.2) bgStyle = "#1e1b4b"; // deep indigo
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      style={{ backgroundColor: bgStyle }}
                      className="rounded-[1px] transition-colors"
                      title={`Band ${rIdx}, T${cIdx}: ${val.toFixed(1)} dB`}
                    />
                  );
                })
              )
            ) : (
              <div className="col-span-16 text-center text-[10px] text-slate-600 py-8">
                Spectrogram data processing...
              </div>
            )}
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>0 Hz (Low Glottal)</span>
            <span>Spectral Energy (dB)</span>
            <span>8,000 Hz (Nyquist)</span>
          </div>
        </div>
      </div>

      {/* 3. Pitch Contour & MFCC Features Dual Column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pitch Contour */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
            <span>Pitch Contour (F0 Trajectory)</span>
            <span className="font-mono text-cyan-400">
              Avg: {data.pitch_mean ? `${Math.round(data.pitch_mean)} Hz` : "N/A"}
            </span>
          </div>
          <div className="h-16 flex items-end justify-between gap-1 pt-2">
            {data.pitch_contour && data.pitch_contour.length > 0 ? (
              data.pitch_contour.map((pitch, idx) => {
                const normHeight = Math.min(Math.max(((pitch - 80) / 240) * 100, 10), 100);
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t transition-all"
                    style={{ height: `${normHeight}%` }}
                    title={`${Math.round(pitch)} Hz`}
                  />
                );
              })
            ) : (
              <div className="w-full text-center text-[10px] text-slate-600 py-4">Analyzing pitch...</div>
            )}
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>Std Dev: {data.pitch_std ? `${data.pitch_std.toFixed(1)} Hz` : "N/A"}</span>
            <span>Natural Range: 80 - 320 Hz</span>
          </div>
        </div>

        {/* Formant Tract Resonances */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">
            Vocal Tract Formants (Resonance Peaks)
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">F1 (Pharyngeal):</span>
              <span className="text-emerald-400 font-bold">
                {data.formants?.F1 ? `${Math.round(data.formants.F1)} Hz` : "500 Hz"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">F2 (Oral Cavity):</span>
              <span className="text-cyan-400 font-bold">
                {data.formants?.F2 ? `${Math.round(data.formants.F2)} Hz` : "1500 Hz"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">F3 (Lip/Dental):</span>
              <span className="text-purple-400 font-bold">
                {data.formants?.F3 ? `${Math.round(data.formants.F3)} Hz` : "2500 Hz"}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-800/80">
            Dispersion Ratio: {(data.formants?.F2 && data.formants?.F1) ? (data.formants.F2 / data.formants.F1).toFixed(2) : "3.00"}
          </div>
        </div>
      </div>
    </div>
  );
}
