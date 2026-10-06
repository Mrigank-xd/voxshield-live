"use client";

import React, { useState } from "react";
import { Sparkles, ShieldCheck, ShieldAlert, RefreshCw, Mic, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { DynamicChallenge } from "@/types";
import { cn } from "@/lib/utils";

interface ChallengeWidgetProps {
  challenge: DynamicChallenge | null;
  onGenerateChallenge: () => void;
  onVerifyResponse: (spokenText: string) => void;
  className?: string;
}

export function ChallengeWidget({
  challenge,
  onGenerateChallenge,
  onVerifyResponse,
  className,
}: ChallengeWidgetProps) {
  const [simulatedSpoken, setSimulatedSpoken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSimulateSpeak = (text: string) => {
    setIsVerifying(true);
    setSimulatedSpoken(text);
    setTimeout(() => {
      onVerifyResponse(text);
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 backdrop-blur-md shadow-lg shadow-cyan-950/20",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
              DYNAMIC LIVENESS CHALLENGE
            </h4>
            <p className="text-[10px] text-slate-400">
              Random Cryptographic Phrase Verification
            </p>
          </div>
        </div>

        <button
          onClick={onGenerateChallenge}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Phrase</span>
        </button>
      </div>

      {challenge ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400/80">
              INSTRUCT CALLER TO SPEAK
            </span>
            <div className="text-2xl font-black tracking-wide text-white font-mono mt-1 mb-1">
              &ldquo;{challenge.challenge_phrase}&rdquo;
            </div>
            <p className="text-xs text-slate-400 font-medium">{challenge.prompt_text}</p>
          </div>

          {/* Status Display */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Challenge Status:</span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold font-mono border",
                  challenge.status === "VERIFIED"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : challenge.status === "FAILED"
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : challenge.status === "SUSPICIOUS"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                )}
              >
                {challenge.status}
              </span>
            </div>

            {challenge.status === "VERIFIED" && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Live Voice Confirmed
              </span>
            )}
            {challenge.status === "FAILED" && (
              <span className="flex items-center gap-1 text-xs text-red-400 font-bold">
                <XCircle className="w-4 h-4" /> Challenge Failed
              </span>
            )}
          </div>

          {/* Test Buttons to simulate or test caller spoken response */}
          <div className="pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
              CALLER RESPONSE VERIFICATION CONTROLS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isVerifying}
                onClick={() => handleSimulateSpeak(challenge.challenge_phrase)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-500/40 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simulate Correct Response</span>
              </button>
              <button
                disabled={isVerifying}
                onClick={() => handleSimulateSpeak("I refuse to say that")}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-red-600/80 hover:bg-red-500 border border-red-500/40 transition-all"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Simulate Refusal / Failed</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800">
          <p className="text-xs text-slate-400 mb-3">
            Adaptive dynamic challenge triggers automatically when risk crosses 65/100, or you can issue a random phrase now.
          </p>
          <button
            onClick={onGenerateChallenge}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/20 transition-all"
          >
            Generate Random Challenge
          </button>
        </div>
      )}
    </div>
  );
}
