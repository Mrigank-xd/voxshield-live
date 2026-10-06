"use client";

import React, { useState } from "react";
import { Clock, AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, ChevronRight, X } from "lucide-react";
import { FraudTimelineEvent, RiskLevel } from "@/types";
import { cn, getRiskColor } from "@/lib/utils";

interface FraudTimelineProps {
  events: FraudTimelineEvent[];
  callDurationSeconds?: number;
  className?: string;
}

export function FraudTimeline({
  events,
  callDurationSeconds = 180,
  className,
}: FraudTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<FraudTimelineEvent | null>(null);

  const getSeverityBadge = (sev: RiskLevel) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              VOICE AUTHENTICITY TIMELINE
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Chronological Acoustic & Social Engineering Events
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          {events.length} Suspicious Flags
        </span>
      </div>

      {/* Horizontal Overview Bar */}
      <div className="relative w-full h-8 bg-slate-950 rounded-xl border border-slate-800/80 mb-4 px-3 flex items-center">
        <div className="absolute inset-x-3 top-1/2 h-0.5 bg-slate-800 -translate-y-1/2" />
        {events.map((ev) => {
          const maxSec = Math.max(callDurationSeconds, 120);
          const posPercent = Math.min(Math.max((ev.timestamp / maxSec) * 100, 4), 96);
          const isSelected = selectedEvent?.id === ev.id;

          return (
            <button
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              style={{ left: `${posPercent}%` }}
              title={`[${ev.formatted_time}] ${ev.title}`}
              className={cn(
                "absolute -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all hover:scale-125 z-10 flex items-center justify-center",
                ev.severity === "CRITICAL"
                  ? "bg-red-500 border-red-300"
                  : ev.severity === "HIGH"
                  ? "bg-orange-500 border-orange-300"
                  : "bg-amber-500 border-amber-300",
                isSelected && "ring-4 ring-cyan-400 scale-125"
              )}
            />
          );
        })}
      </div>

      {/* Event List */}
      <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No anomalous events recorded yet. Call proceeding under natural parameters.
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              className={cn(
                "p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between",
                selectedEvent?.id === ev.id
                  ? "bg-slate-800/80 border-cyan-500/60 shadow-md"
                  : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-cyan-400 font-bold text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {ev.formatted_time}
                </span>
                <div>
                  <div className="font-semibold text-slate-200">{ev.title}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[280px]">
                    {ev.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase",
                    getSeverityBadge(ev.severity)
                  )}
                >
                  {ev.severity}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Modal/Drawer when clicking an event */}
      {selectedEvent && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 relative animate-in fade-in">
          <button
            onClick={() => setSelectedEvent(null)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>TIMESTAMP: {selectedEvent.formatted_time}</span>
          </div>
          <h5 className="text-sm font-bold text-white mt-1">{selectedEvent.title}</h5>
          <p className="text-xs text-slate-300 mt-1">{selectedEvent.description}</p>
          <div className="mt-2 text-[10px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800">
            EVENT TYPE: {selectedEvent.event_type} | SEVERITY: {selectedEvent.severity}
          </div>
        </div>
      )}
    </div>
  );
}
