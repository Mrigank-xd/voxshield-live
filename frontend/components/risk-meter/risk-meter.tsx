"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { getRiskColor, cn } from "@/lib/utils";
import { RiskLevel } from "@/types";

interface RiskMeterProps {
  score: number;
  level: RiskLevel;
  confidence?: number;
  className?: string;
}

export function RiskMeter({ score, level, confidence = 0.88, className }: RiskMeterProps) {
  const styles = getRiskColor(score);

  // SVG Gauge calculations (radius = 70, arc = 240 degrees)
  const radius = 68;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree open gauge arc
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(Math.max(score, 0), 100)) / 100;

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-5 flex flex-col items-center justify-between backdrop-blur-md transition-all duration-500",
        styles.bg,
        styles.border,
        score >= 80 && "pulse-critical",
        className
      )}
    >
      <div className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
        <span className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          FRAUD RISK ENGINE
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          CONF: {Math.round(confidence * 100)}%
        </span>
      </div>

      {/* Circular Gauge */}
      <div className="relative w-44 h-44 flex items-center justify-center my-2">
        <svg className="w-full h-full transform rotate-150" viewBox="0 0 160 160">
          {/* Background Track Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#1e293b"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Progress Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke={
              score >= 80
                ? "#ef4444"
                : score >= 60
                ? "#f97316"
                : score >= 30
                ? "#f59e0b"
                : "#10b981"
            }
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
            {score}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            / 100 RISK
          </span>
          <div
            className={cn(
              "mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border tracking-wider",
              styles.badge
            )}
          >
            {level} RISK
          </div>
        </div>
      </div>

      {/* Graduated Range Legend */}
      <div className="w-full grid grid-cols-4 gap-1 text-[9px] font-semibold text-center mt-2 border-t border-slate-800/80 pt-3">
        <div className={cn("py-1 rounded", score < 30 ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-500")}>
          0-29 LOW
        </div>
        <div className={cn("py-1 rounded", score >= 30 && score < 60 ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-500")}>
          30-59 MED
        </div>
        <div className={cn("py-1 rounded", score >= 60 && score < 80 ? "bg-orange-500/20 text-orange-300 font-bold" : "text-slate-500")}>
          60-79 HIGH
        </div>
        <div className={cn("py-1 rounded", score >= 80 ? "bg-red-500/20 text-red-300 font-bold" : "text-slate-500")}>
          80+ CRIT
        </div>
      </div>
    </div>
  );
}
