"use client";

import React from "react";
import { Video, UserCheck, Eye, Smile, AlertTriangle, ShieldCheck } from "lucide-react";
import { VideoAnalysisData } from "@/types";
import { cn } from "@/lib/utils";

interface FaceCardProps {
  data: VideoAnalysisData;
  videoEnabled?: boolean;
  className?: string;
}

export function FaceCard({ data, videoEnabled = true, className }: FaceCardProps) {
  const authPercent = Math.round(data.face_authenticity_score * 100);
  const matchPercent = Math.round(data.face_match_score * 100);
  const isAnomalous = authPercent < 75 || matchPercent < 75;

  if (!videoEnabled) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-slate-800 bg-slate-900/30 p-4 text-center flex flex-col items-center justify-center min-h-[140px]",
          className
        )}
      >
        <Video className="w-8 h-8 text-slate-600 mb-2" />
        <span className="text-xs font-bold text-slate-400">VOICE-ONLY MODE ACTIVE</span>
        <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
          Webcam stream not connected. Multimodal risk engine has gracefully adapted to audio-only acoustic telemetry.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 backdrop-blur-md transition-all",
        isAnomalous ? "border-amber-500/40 bg-amber-950/20" : "border-slate-800 bg-slate-900/40",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              LIVE WEBCAM FACE VERIFICATION
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              OpenCV Neural Landmark Tracking
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-[10px] font-mono px-2 py-0.5 rounded font-bold border",
            authPercent >= 80
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          )}
        >
          {authPercent >= 80 ? "FACE AUTHENTIC" : "POSSIBLE MANIPULATION"}
        </span>
      </div>

      {/* Dual Metrics */}
      <div className="grid grid-cols-2 gap-3 my-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Face Authenticity</div>
          <div
            className={cn(
              "text-2xl font-black font-mono mt-1",
              authPercent >= 80 ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {authPercent}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Deepfake Artifact Check</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Identity Match</div>
          <div
            className={cn(
              "text-2xl font-black font-mono mt-1",
              matchPercent >= 80 ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {matchPercent}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Reference Alignment</div>
        </div>
      </div>

      {/* Emotion & Expression Status */}
      <div className="flex items-center justify-between text-xs px-2.5 py-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Smile className="w-3.5 h-3.5 text-cyan-400" />
          <span>Expression: <b>{data.emotion_detected || "Neutral"}</b></span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">68 Landmarks Tracked</span>
      </div>
    </div>
  );
}
