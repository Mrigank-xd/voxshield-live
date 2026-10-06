"use client";

import React from "react";
import { MessageSquare, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LipSyncMeterProps {
  score: number; // 0.0 - 1.0
  offsetMs?: number;
  className?: string;
}

export function LipSyncMeter({ score, offsetMs = 0, className }: LipSyncMeterProps) {
  const syncPercent = Math.round(score * 100);
  const isMismatch = syncPercent < 60;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 backdrop-blur-md transition-all",
        isMismatch
          ? "border-red-500/40 bg-red-950/20"
          : "border-slate-800 bg-slate-900/40",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isMismatch ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"
            )}
          >
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              LIP-SYNC & A/V TIMING
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Speech Energy vs Mouth Aperture
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded font-bold border",
            isMismatch
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          )}
        >
          {isMismatch ? "DESYNC DETECTED" : "SYNCHRONIZED"}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-3 mb-1">
        <span className="text-2xl font-black font-mono text-white">
          {syncPercent}%
        </span>
        <span className="text-xs font-mono text-slate-400">
          A/V Offset: <b className={Math.abs(offsetMs) > 150 ? "text-red-400" : "text-emerald-400"}>{offsetMs > 0 ? `+${offsetMs}` : offsetMs} ms</b>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            syncPercent >= 80 ? "bg-emerald-500" : syncPercent >= 60 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${syncPercent}%` }}
        />
      </div>

      {isMismatch && (
        <div className="mt-3 flex items-start gap-2 p-2 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Acoustic speech energy detected while facial lips remain stationary or out-of-phase.</span>
        </div>
      )}
    </div>
  );
}
