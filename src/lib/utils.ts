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
