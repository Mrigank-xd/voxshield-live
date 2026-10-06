import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getRiskColor(score: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  gradient: string;
} {
  if (score >= 80) {
    return {
      bg: "bg-red-950/40",
      text: "text-red-400",
      border: "border-red-600",
      badge: "bg-red-500/20 text-red-400 border-red-500/40",
      gradient: "from-red-600 to-rose-700",
    };
  }
  if (score >= 60) {
    return {
      bg: "bg-orange-950/40",
      text: "text-orange-400",
      border: "border-orange-500",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/40",
      gradient: "from-orange-500 to-amber-600",
    };
  }
  if (score >= 30) {
    return {
      bg: "bg-amber-950/30",
      text: "text-amber-400",
      border: "border-amber-500/60",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      gradient: "from-amber-500 to-yellow-600",
    };
  }
  return {
    bg: "bg-emerald-950/30",
    text: "text-emerald-400",
    border: "border-emerald-500/60",
    badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    gradient: "from-emerald-500 to-teal-600",
  };
}
