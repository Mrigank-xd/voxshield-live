"use client";

import React from "react";
import { HelpCircle, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplainablePanelProps {
  score: number;
  confidence: number;
  explanations: string[];
  recommendedAction: string;
  className?: string;
}

export function ExplainablePanel({
  score,
  confidence,
  explanations,
  recommendedAction,
  className,
}: ExplainablePanelProps) {
  const isHighRisk = score >= 60;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 backdrop-blur-md transition-all",
        isHighRisk
          ? "border-red-500/40 bg-red-950/20"
          : "border-slate-800 bg-slate-900/40",
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              isHighRisk ? "bg-red-500/20 text-red-400" : "bg-cyan-500/20 text-cyan-400"
            )}
          >
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              EXPLAINABLE AI REASONING
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Transparent Multi-Layer Decision Rationale
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-cyan-400">
          Confidence: {Math.round(confidence * 100)}%
        </span>
      </div>

      <div className="my-3">
        <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wide mb-2">
          Why is this call assessed at {score}/100 Risk?
        </h5>

        <div className="space-y-1.5">
          {explanations && explanations.length > 0 ? (
            explanations.map((exp, idx) => {
              const isAnomaly = exp.startsWith("+") && !exp.includes("match natural");
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg text-xs font-medium leading-relaxed",
                    isAnomaly ? "bg-red-950/30 text-red-200" : "bg-slate-950/60 text-slate-300"
                  )}
                >
                  <span className={cn("font-bold", isAnomaly ? "text-red-400" : "text-emerald-400")}>
                    {exp.slice(0, 1)}
                  </span>
                  <span>{exp.slice(2)}</span>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-400">
              Awaiting continuous conversation and biometric telemetry...
            </div>
          )}
        </div>
      </div>

      {/* Recommended Action Box */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start gap-2.5 text-xs">
        <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block">Recommended Cyber Action:</span>
          <span className="text-slate-300">{recommendedAction}</span>
        </div>
      </div>
    </div>
  );
}
