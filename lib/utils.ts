import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtDate(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  const dd = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { day, dd, mon, hh, mm };
}

export function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "STARTED";
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (days >= 1) return `IN ${days}D ${hrs}H`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `IN ${hrs}H ${mins}M`;
}
