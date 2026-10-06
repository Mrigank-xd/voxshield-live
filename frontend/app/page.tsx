import Link from "next/link";
import {
  Shield,
  PhoneCall,
  Activity,
  UserCheck,
  Video,
  Radio,
  FileText,
  Lock,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const signalLayers = [
    { title: "Voice Clone Detection", desc: "Acoustic micro-jitter, spectral flatness, formant dispersion and neural vocoder artifact detection.", icon: Radio, score: "Sub-0.2% Jitter" },
    { title: "Speaker Verification", desc: "Privacy-preserving 128-d acoustic vector cosine match against enrolled trusted executive profiles.", icon: UserCheck, score: "128-d Embed" },
    { title: "Live Webcam Face Auth", desc: "OpenCV landmark tracking, texture gradient variance, and neural deepfake manipulation detection.", icon: Video, score: "68 Landmarks" },
    { title: "Lip-Sync Synchronization", desc: "Cross-modal correlation between speech acoustic syllable onsets and mouth aperture velocity.", icon: Activity, score: "<150ms A/V" },
    { title: "Acoustic Replay Attack", desc: "Probabilistic room impulse response, loudspeaker transducer rolloff, and comb-filtering analysis.", icon: Shield, score: "Comb Filter" },
    { title: "Scam Intent NLP", desc: "Real-time extraction of OTP requests, financial urgency, account suspension threats, and impersonation.", icon: Zap, score: "10 Categories" },
    { title: "Dynamic Challenge", desc: "Unpredictable random vocal liveness challenge (e.g. 'Blue Falcon 742') triggered adaptively.", icon: Sparkles, score: "Adaptive Liveness" },
    { title: "Zero-Raw-Media Privacy", desc: "Ephemeral feature extraction with immediate buffer purging. Cryptographic SHA-256 evidence anchors.", icon: Lock, score: "Zero Storage" },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950/80 to-[#090d16] p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Autonomous Real-Time Multi-Modal Protection</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Your call is live. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              So is your protection.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            VOXSHIELD LIVE inspects incoming callers across 18 independent acoustic, visual, and semantic signals—detecting generative voice clones, deepfake face reenactment, acoustic replay attacks, and coercive financial scam intent within milliseconds.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/call"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-cyan-600/25 transition-all hover:scale-105"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Launch Live Call Monitor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>SOC Forensics Workbench</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-800/80">
          <div>
            <div className="text-2xl font-black font-mono text-cyan-400">&lt; 150 ms</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Continuous Window Latency</div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-emerald-400">18 Signals</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Multi-Layer Fusion Engine</div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-indigo-400">128-d Vector</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Privacy Speaker Embeddings</div>
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-rose-400">0s Storage</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Ephemeral Raw Buffer Retention</div>
          </div>
        </div>
      </div>

      {/* Architecture Signal Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              MULTI-LAYER DETECTION ARCHITECTURE
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Independent acoustic, facial biometric, and conversational intent streams fused in real time
            </p>
          </div>
          <Link
            href="/verify"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Enroll Trusted Executive Profiles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {signalLayers.map((layer, idx) => {
            const Icon = layer.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-all hover:border-slate-700 backdrop-blur-md flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-950 border border-slate-800 text-slate-400">
                      {layer.score}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {layer.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">
                    {layer.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graduated Action Model & Explainable AI Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-slate-900/30 space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Graduated Intervention Policy (Non-Accusing)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike crude blocking tools, VoxShield enforces graduated intervention: <b>LOW (0-29)</b> triggers silent monitoring; <b>MEDIUM (30-59)</b> displays subtle vigilance cues; <b>HIGH (60-79)</b> issues prominent caller verification warnings; and <b>CRITICAL (80-100)</b> mandates out-of-band verification before fund transfers or credential releases.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
              <span className="text-xs font-bold text-emerald-400 block">0–29 LOW</span>
              <span className="text-[10px] text-slate-400">Silent Monitoring</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-center">
              <span className="text-xs font-bold text-amber-400 block">30–59 MEDIUM</span>
              <span className="text-[10px] text-slate-400">Elevated Vigilance</span>
            </div>
            <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-center">
              <span className="text-xs font-bold text-orange-400 block">60–79 HIGH</span>
              <span className="text-[10px] text-slate-400">Warning & Verify</span>
            </div>
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-center">
              <span className="text-xs font-bold text-red-400 block">80–100 CRIT</span>
              <span className="text-[10px] text-slate-400">Intervention Req.</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/30 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Forensic Evidence Export
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every flagged call generates court-admissible PDF forensic reports detailing acoustic spectral signatures, conversation transcripts, and tamper-evident SHA-256 integrity digests.
            </p>
          </div>
          <Link
            href="/cases"
            className="mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <span>Review Incident Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
