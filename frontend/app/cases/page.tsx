"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, ShieldAlert, FileText, Search, Filter, ArrowRight, Clock } from "lucide-react";
import { CaseRecord } from "@/types";
import { cn, getRiskColor } from "@/lib/utils";

export default function CasesListPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      const res = await fetch("http://localhost:8000/api/cases/");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (e) {
      setCases([
        {
          id: "case-9812",
          case_number: "VX-2026-9812",
          call_id: "call-demo-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: "INVESTIGATING",
          risk_score: 87,
          risk_level: "CRITICAL",
          investigator_notes: "High severity wire fraud intercepted. Synthetic vocal markers confirmed.",
          recommended_action: "Require independent out-of-band verification before fund release.",
          report_generated: true,
        },
      ]);
    }
  }

  const filteredCases = cases.filter((c) => {
    const matchesStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchesSearch =
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.recommended_action.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              FRAUD INVESTIGATION CASES
            </h1>
            <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
              FORENSIC AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Archived Telephony Incident Logs, Threat Dissections & PDF Report Exports
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search case #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/60"
          >
            <option value="ALL">All Statuses</option>
            <option value="INVESTIGATING">Under Investigation</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCases.map((c) => {
          const riskStyles = getRiskColor(c.risk_score);
          return (
            <div
              key={c.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 backdrop-blur-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-black font-mono text-cyan-400">
                    {c.case_number}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono",
                      riskStyles.badge
                    )}
                  >
                    RISK: {c.risk_score}/100 ({c.risk_level})
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-bold">
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  {c.recommended_action}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                  <span>Call ID: {c.call_id}</span>
                  <span>•</span>
                  <span>Created: {new Date(c.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Link
                  href={`/cases/${c.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <span>Review Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/reports/${c.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
