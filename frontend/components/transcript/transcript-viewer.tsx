"use client";

import React, { useState } from "react";
import { Search, MessageSquare, AlertTriangle, Shield, Filter } from "lucide-react";
import { TranscriptUtterance } from "@/types";
import { cn } from "@/lib/utils";

interface TranscriptViewerProps {
  utterances: TranscriptUtterance[];
  className?: string;
}

export function TranscriptViewer({ utterances, className }: TranscriptViewerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = [
    "ALL",
    "OTP_REQUEST",
    "MONEY_TRANSFER",
    "URGENCY_COERCION",
    "ACCOUNT_SUSPENSION_THREAT",
    "REMOTE_ACCESS",
    "IMPERSONATION",
  ];

  const filteredUtterances = utterances.filter((utt) => {
    const matchesSearch =
      utt.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      utt.speaker_role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "ALL" || utt.detected_categories.includes(selectedCategory);
    return matchesSearch && matchesCat;
  });

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "OTP_REQUEST":
        return "bg-red-500/20 text-red-400 border-red-500/40";
      case "MONEY_TRANSFER":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      case "URGENCY_COERCION":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "ACCOUNT_SUSPENSION_THREAT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "REMOTE_ACCESS":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      case "IMPERSONATION":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-md flex flex-col h-[420px]",
        className
      )}
    >
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              LIVE CONVERSATION TRANSCRIPT
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Streaming NLP Intent Analysis
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-[10px] font-semibold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-2.5 py-1 rounded-full whitespace-nowrap transition-all border",
              selectedCategory === cat
                ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            )}
          >
            {cat === "ALL" ? "All Utterances" : cat.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Scrollable Utterances */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredUtterances.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">Awaiting live speech transcript segments...</p>
          </div>
        ) : (
          filteredUtterances.map((utt) => {
            const isCaller = utt.speaker_role === "caller";
            const hasSevereScam = utt.scam_intent_score >= 60;

            return (
              <div
                key={utt.id}
                className={cn(
                  "p-3 rounded-xl border text-xs transition-all",
                  hasSevereScam
                    ? "bg-red-950/20 border-red-500/40"
                    : "bg-slate-950/70 border-slate-800/80"
                )}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 font-semibold">
                      [{utt.formatted_time}]
                    </span>
                    <span
                      className={cn(
                        "font-extrabold uppercase tracking-wide",
                        isCaller ? "text-cyan-400" : "text-emerald-400"
                      )}
                    >
                      {isCaller ? "Caller" : "User"}:
                    </span>
                  </div>

                  {utt.scam_intent_score > 0 && (
                    <span
                      className={cn(
                        "font-mono text-[10px] px-1.5 py-0.5 rounded font-bold border",
                        hasSevereScam
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      )}
                    >
                      Intent: {Math.round(utt.scam_intent_score)}/100
                    </span>
                  )}
                </div>

                {/* Spoken Text */}
                <p className="text-slate-200 leading-relaxed font-normal text-[12.5px]">
                  &ldquo;{utt.text}&rdquo;
                </p>

                {/* Detected Badges */}
                {utt.detected_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-slate-800/60">
                    {utt.detected_categories.map((cat) => (
                      <span
                        key={cat}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[9.5px] font-extrabold uppercase border",
                          getCategoryBadgeColor(cat)
                        )}
                      >
                        {cat.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
