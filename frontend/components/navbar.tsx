"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, PhoneCall, LayoutDashboard, UserCheck, FolderKanban, Settings, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Live Call", href: "/call", icon: PhoneCall },
    { label: "SOC Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Speaker Verify", href: "/verify", icon: UserCheck },
    { label: "Investigation Cases", href: "/cases", icon: FolderKanban },
    { label: "Privacy & Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white">VOXSHIELD</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">
              Real-Time Voice-Clone & Scam Protection
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all",
                  isActive
                    ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700/60"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-cyan-400" : "text-slate-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline font-mono text-[11px]">SHIELD ACTIVE</span>
          </div>

          <Link
            href="/call"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-cyan-600/20 transition-all hover:shadow-cyan-600/30"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Launch Call</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
