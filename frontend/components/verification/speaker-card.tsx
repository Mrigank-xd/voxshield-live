"use client";

import React from "react";
import { UserCheck, UserX, ShieldCheck, AlertCircle } from "lucide-react";
import { SpeakerVerifyData } from "@/types";
import { cn } from "@/lib/utils";

interface SpeakerCardProps {
  data: SpeakerVerifyData;
  className?: string;
}

export function SpeakerCard({ data, className }: SpeakerCardProps) {
  const matchPercent = Math.round(data.speaker_match_score * 100);
  const isMatch = data.verification_status === "VERIFIED";
  const isMismatch = data.verification_status === "MISMATCH";

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 backdrop-blur-md transition-all",
        isMismatch
          ? "border-red-500/40 bg-red-950/20"
          : isMatch
          ? "border-emerald-500/40 bg-emerald-950/20"
          : "border-slate-800 bg-slate-900/40",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isMismatch
                ? "bg-red-500/20 text-red-400"
                : isMatch
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-blue-500/20 text-blue-400"
            )}
          >
            {isMismatch ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              SPEAKER VERIFICATION
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Privacy-Preserving 128-d Acoustic Embedding
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded font-bold border",
            isMatch
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : isMismatch
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-slate-800 text-slate-300 border-slate-700"
          )}
        >
          {data.verification_status}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-3 mb-1">
        <span
          className={cn(
            "text-2xl font-black font-mono",
            isMatch ? "text-emerald-400" : isMismatch ? "text-red-400" : "text-white"
          )}
        >
          {matchPercent}%
        </span>
        <span className="text-xs font-mono text-slate-400">
          Profile: <b className="text-slate-200">{data.claimed_identity || "Executive Baseline"}</b>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            matchPercent >= 80 ? "bg-emerald-500" : matchPercent >= 65 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${matchPercent}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed font-medium">
        {data.message}
      </p>
    </div>
  );
}
