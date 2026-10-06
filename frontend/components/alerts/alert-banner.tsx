"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck, CheckCircle2, ChevronRight, UserCheck } from "lucide-react";
import { cn, getRiskColor } from "@/lib/utils";
import { RiskLevel } from "@/types";

interface AlertBannerProps {
  score: number;
  level: RiskLevel;
  alertMessage: string | null;
  recommendedAction: string;
  detectedCategories?: string[];
  onTriggerVerify?: () => void;
  className?: string;
}

export function AlertBanner({
  score,
  level,
  alertMessage,
  recommendedAction,
  detectedCategories = [],
  onTriggerVerify,
  className,
}: AlertBannerProps) {
  const styles = getRiskColor(score);

  if (level === "LOW" && !alertMessage) {
    return (
      <div
        className={cn(
          "rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 flex items-center justify-between text-xs text-emerald-300",
          className
        )}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <b>SILENT MONITORING ACTIVE:</b> Vocal and conversational dynamics match safe baseline.
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          PROTECTION ON
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 backdrop-blur-md transition-all duration-300",
        styles.bg,
        styles.border,
        level === "CRITICAL" && "pulse-critical",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          {level === "CRITICAL" || level === "HIGH" ? (
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-extrabold uppercase tracking-wider", styles.text)}>
                {level === "CRITICAL" ? "⚠ CRITICAL FRAUD INTERVENTION" : `⚠ ${level} RISK WARNING`}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                SCORE: {score}/100
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-100 mt-1">
              {alertMessage || "Anomalous patterns detected during live call."}
            </p>

            {detectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {detectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700"
                  >
                    • {cat.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-slate-300 mt-2 flex items-center gap-1.5">
              <span className="font-bold text-slate-100">Recommended Action:</span>
              <span>{recommendedAction}</span>
            </div>
          </div>
        </div>

        {onTriggerVerify && (
          <div className="flex sm:flex-col justify-end shrink-0">
            <button
              onClick={onTriggerVerify}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-700/30 transition-all hover:scale-[1.02]"
            >
              <UserCheck className="w-4 h-4" />
              <span>VERIFY CALLER NOW</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
