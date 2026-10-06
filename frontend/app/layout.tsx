import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "VOXSHIELD LIVE | Real-Time Voice-Clone & Scam Detection",
  description: "Your call is live. So is your protection. Autonomous multi-modal AI voice clone and scam detection during live voice and video calls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        {/* Subtle Cyber Grid Background */}
        <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        <div className="relative flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          
          <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-300">VOXSHIELD LIVE</span>
                <span>— Real-Time Telephony Cybersecurity Architecture</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Zero-Raw-Media Ephemeral Retention</span>
                <span>•</span>
                <span>WebRTC / Opus 16 kHz</span>
                <span>•</span>
                <span>Explainable AI Engine</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
