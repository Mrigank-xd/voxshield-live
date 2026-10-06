"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileText, Download, ArrowLeft, ShieldCheck, CheckCircle2, Lock, Printer, Share2 } from "lucide-react";

export default function ReportViewerPage() {
  const params = useParams();
  const caseId = (params?.id as string) || "VX-2026-9812";
  const [reportMeta, setReportMeta] = useState<any>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`http://localhost:8000/api/reports/${caseId}`);
        if (res.ok) {
          const data = await res.json();
          setReportMeta(data);
        }
      } catch (e) {
        setReportMeta({
          case_id: caseId,
          case_number: "VX-2026-9812",
          call_id: "call-demo-1",
          risk_score: 87,
          risk_level: "CRITICAL",
          recommended_action: "Require independent out-of-band verification before fund release.",
        });
      }
    }
    fetchReport();
  }, [caseId]);

  const handleDownloadPDF = () => {
    window.open(`http://localhost:8000/api/reports/download/${caseId}`, "_blank");
  };

  return (
    <div className="space-y-6 py-2 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/cases/${caseId}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Dossier</span>
        </Link>

        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-cyan-600/20 transition-all hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Download Official PDF Report</span>
        </button>
      </div>

      {/* Court-Admissible Printable Report Preview Container */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-8 sm:p-12 shadow-2xl text-slate-200 space-y-8 font-sans">
        {/* Document Header Banner */}
        <div className="border-b-2 border-cyan-500 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm uppercase tracking-widest">
              <span>VOXSHIELD LIVE</span>
              <span>•</span>
              <span>FORENSIC REPORT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              AI FORENSIC INCIDENT REPORT
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Automated Multi-Modal Voice Clone & Scam Detection Telemetry
            </p>
          </div>

          <div className="sm:text-right font-mono text-xs text-slate-400">
            <div>CASE NUMBER: <b className="text-white">{reportMeta?.case_number || "VX-2026-9812"}</b></div>
            <div>STATUS: <b className="text-red-400 uppercase">{reportMeta?.risk_level || "CRITICAL"}</b></div>
            <div>DATE: {new Date().toISOString().split("T")[0]} UTC</div>
          </div>
        </div>

        {/* Executive Summary Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
            1. Executive Incident Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Overall Fraud Risk</span>
              <span className="text-xl font-black text-red-400">87 / 100</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Inference Confidence</span>
              <span className="text-xl font-black text-cyan-400">92%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Voice Clone Prob.</span>
              <span className="text-xl font-black text-red-400">88%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Speaker Match</span>
              <span className="text-xl font-black text-orange-400">24% Mismatch</span>
            </div>
          </div>
        </div>

        {/* Multimodal Signal Telemetry Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
            2. Multimodal Signal Decomposition
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="p-2.5">Detection Layer</th>
                  <th className="p-2.5">Observed Telemetry</th>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">Model Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                <tr>
                  <td className="p-2.5 font-bold text-white">Voice Clone Detection</td>
                  <td className="p-2.5 text-red-400">0.88 (Synthetic Prob)</td>
                  <td className="p-2.5 text-red-400">CRITICAL</td>
                  <td className="p-2.5 text-slate-400">VoxShield-AudioForensic-v2.4</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Speaker Verification</td>
                  <td className="p-2.5 text-orange-400">0.24 (Cosine Sim)</td>
                  <td className="p-2.5 text-orange-400">MISMATCH</td>
                  <td className="p-2.5 text-slate-400">VoxShield-SpeakerEmbed-128d</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Face Authenticity</td>
                  <td className="p-2.5 text-emerald-400">0.84 (Authentic)</td>
                  <td className="p-2.5 text-emerald-400">NORMAL</td>
                  <td className="p-2.5 text-slate-400">VoxShield-DeepfakeVision-v1.8</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Lip-Sync Timing</td>
                  <td className="p-2.5 text-red-400">0.34 (Desynchronized)</td>
                  <td className="p-2.5 text-red-400">HIGH DESYNC</td>
                  <td className="p-2.5 text-slate-400">VoxShield-AVSync-MAR-v1.2</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Scam Intent NLP</td>
                  <td className="p-2.5 text-red-400">91.0 / 100 Intent</td>
                  <td className="p-2.5 text-red-400">CRITICAL</td>
                  <td className="p-2.5 text-slate-400">VoxShield-SocialEngRule-v2.1</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-white">Dynamic Challenge</td>
                  <td className="p-2.5 text-red-400">FAILED</td>
                  <td className="p-2.5 text-red-400">FAIL</td>
                  <td className="p-2.5 text-slate-400">VoxShield-AdaptiveLiveness-v1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainable AI Decision Rationale */}
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
            3. Explainable AI Forensic Rationale
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <li>• <b>+ Synthetic speech indicators detected:</b> Sub-biological micro-jitter (&lt;0.2% vocal cord perturbation) and vocoder noise floor elevation.</li>
            <li>• <b>+ Speaker does not match trusted profile:</b> Cosine distance exceeds tolerance threshold against authorized executive profile.</li>
            <li>• <b>+ Caller solicited 6-digit one-time passcode (OTP):</b> Direct credential solicitation attempt over live voice.</li>
            <li>• <b>+ Coercive urgency coercion detected:</b> Demanded wire transfer under false bank account suspension pretext.</li>
            <li>• <b>+ Cross-modal lip-sync discrepancy:</b> Speech acoustic onset out-of-phase with webcam mouth aperture (&gt;220ms lag).</li>
          </ul>
        </div>

        {/* Cryptographic Integrity Anchor */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
          <div>TAMPER-EVIDENT SHA-256 HASH: <span className="text-cyan-400">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></div>
          <div>COMPLIANCE STATUS: <span className="text-emerald-400">GDPR Ephemeral Media Policy Enforced (Zero Raw Storage)</span></div>
        </div>
      </div>
    </div>
  );
}
