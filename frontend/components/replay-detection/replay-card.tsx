"use client";

import React from "react";
import { Volume2, Radio, AlertTriangle, ShieldCheck } from "lucide-react";
import { ReplayData } from "@/types";
import { cn } from "@/lib/utils";

interface ReplayCardProps {
  data: ReplayData;
  className?: string;
}

export function ReplayCard({ data, className }: ReplayCardProps) {
  const replayPercent = Math.round(data.replay_probability * 100);
  const isReplaySuspected = replayPercent >= 50;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 backdrop-blur-md transition-all",
        isReplaySuspected
          ? "border-amber-500/40 bg-amber-950/20"
          : "border-slate-800 bg-slate-900/40",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isReplaySuspected ? "bg-amber-500/20 text-amber-400" : "bg-cyan-500/20 text-cyan-400"
            )}
          >
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              ACOUSTIC REPLAY ATTACK DETECTOR
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Loudspeaker Comb Filtering & Room Acoustics
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded font-bold border",
            isReplaySuspected
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          )}
        >
          {isReplaySuspected ? "REPLAY SUSPECTED" : "DIRECT MICROPHONE"}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-3 mb-1">
        <span className="text-2xl font-black font-mono text-white">
          {replayPercent}%
        </span>
        <span className="text-xs font-mono text-slate-400">
          Confidence: {Math.round(data.confidence * 100)}% (Probabilistic)
        </span>
      </div>

      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            replayPercent < 35 ? "bg-emerald-500" : replayPercent < 60 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${replayPercent}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400 mt-2.5">
        Analyzes dual room reverberation tails and high-frequency transducer rolloff to detect whether speech is being played through an external speaker.
      </p>
    </div>
  );
}
