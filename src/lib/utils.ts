import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, Locale } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() || "";
  return (
    (words[0][0] || "") + (words[words.length - 1][0] || "")
  ).toUpperCase();
}

export function formatDate(
  date: Date | string,
  dateFormat = "dd-MM-yyyy",
  locale: Locale = id
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return format(d, dateFormat, { locale });
}

export const formatSrtTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const milliseconds = ms % 1000

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${milliseconds.toString().padStart(3, "0")}`
}

// Format milliseconds to MM:SS.mmm
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = ms % 1000

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
}

// Format milliseconds to MM:SS for display
export const formatTimeMMSS = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}



