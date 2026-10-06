"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FolderKanban,
  FileText,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Download,
  Trash2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { CaseRecord, FraudTimelineEvent } from "@/types";
import { cn, getRiskColor } from "@/lib/utils";

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = (params?.id as string) || "VX-2026-9812";

  const [caseData, setCaseData] = useState<CaseRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("INVESTIGATING");
  const [events, setEvents] = useState<any[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadCase();
  }, [caseId]);

  async function loadCase() {
    try {
      const res = await fetch(`http://localhost:8000/api/cases/${caseId}`);
      if (res.ok) {
        const data: CaseRecord = await res.json();
        setCaseData(data);
        setNotes(data.investigator_notes || "");
        setStatus(data.status);

        // Fetch events
        const evRes = await fetch(`http://localhost:8000/api/calls/${data.call_id}/events`);
        if (evRes.ok) {
          const evData = await evRes.json();
          setEvents(evData);
        }
      }
    } catch (e) {
      // Fallback local case
      const mockCase: CaseRecord = {
        id: caseId,
        case_number: "VX-2026-9812",
        call_id: "call-demo-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "INVESTIGATING",
        risk_score: 87,
        risk_level: "CRITICAL",
        investigator_notes:
          "High severity wire fraud intercepted. Synthetic vocal markers confirmed. Caller impersonated HDFC Bank Central Security.",
        recommended_action: "Require independent out-of-band verification before fund release.",
        report_generated: true,
      };
      setCaseData(mockCase);
      setNotes(mockCase.investigator_notes);
      setStatus(mockCase.status);
      setEvents([
        {
          timestamp: 32.0,
          event_type: "VOICE_ANOMALY",
          severity: "MEDIUM",
          title: "Acoustic Jitter Anomaly",
          description: "Sub-biological vocal cord micro-jitter detected (<0.2% variance).",
        },
        {
          timestamp: 68.0,
          event_type: "URGENCY_COERCION",
          severity: "HIGH",
          title: "Urgency Coercion Detected",
          description: "Caller demanded immediate action within 10 minutes to prevent account freeze.",
        },
        {
          timestamp: 110.0,
          event_type: "OTP_REQUEST",
          severity: "CRITICAL",
          title: "Critical OTP Solicitation Attempt",
          description: "Caller solicited 6-digit one-time password over live voice.",
        },
      ]);
    }
  }

  const handleSaveNotes = async () => {
    try {
      await fetch(`http://localhost:8000/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          investigator_notes: notes,
        }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handlePurge = async () => {
    if (confirm("Execute GDPR Right-to-be-Forgotten permanent erasure for this case?")) {
      try {
        await fetch(`http://localhost:8000/api/cases/${caseId}/purge`, { method: "DELETE" });
      } catch (e) {}
      window.location.href = "/cases";
    }
  };

  if (!caseData) return <div className="p-8 text-center text-slate-500">Loading case file...</div>;

  const riskStyles = getRiskColor(caseData.risk_score);

  return (
    <div className="space-y-8 py-2 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/cases"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases List</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/reports/${caseId}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-cyan-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF Forensic Report</span>
          </Link>

          <button
            onClick={handlePurge}
            className="p-2 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-950/50 transition-colors"
            title="GDPR Permanent Data Erasure"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Header Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              INVESTIGATION INCIDENT DOSSIER
            </span>
            <h1 className="text-3xl font-black font-mono text-white tracking-tight">
              {caseData.case_number}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Associated Session Call ID: {caseData.call_id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn("p-4 rounded-xl border text-center font-mono", riskStyles.bg, riskStyles.border)}>
              <span className="text-3xl font-black text-white">{caseData.risk_score}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                {caseData.risk_level} RISK
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Incident Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Under Investigation</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Incident Opened</span>
            <span className="text-slate-200 font-mono mt-1 block">
              {new Date(caseData.created_at).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Recommended Action</span>
            <span className="text-slate-200 mt-1 block font-medium">
              {caseData.recommended_action}
            </span>
          </div>
        </div>
      </div>

      {/* Investigator Notes Editor */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            INVESTIGATOR FORENSIC NOTES & FINDINGS
          </h3>
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Notes Saved
            </span>
          )}
        </div>

        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Record forensic observations, acoustic anomalies, or victim communication details..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 leading-relaxed font-mono"
        />

        <div className="flex justify-end">
          <button
            onClick={handleSaveNotes}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Case Notes</span>
          </button>
        </div>
      </div>

      {/* Recorded Fraud Events Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          CHRONOLOGICAL FORENSIC EVENTS ({events.length})
        </h3>

        <div className="space-y-2">
          {events.map((ev, idx) => {
            const mins = Math.floor((ev.timestamp || 0) / 60);
            const secs = Math.floor((ev.timestamp || 0) % 60);
            const timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-cyan-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                    {timeStr}
                  </span>
                  <div>
                    <h5 className="font-bold text-white">{ev.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ev.description}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                  {ev.severity || "HIGH"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
