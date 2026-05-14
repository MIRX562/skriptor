"use client";

import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, UserPlus } from "lucide-react";
import { cn, formatTimeMMSS } from "@/lib/utils";
import type { Speaker } from "../model/use-transcription";
import type { TranscriptionSegment } from "../store/transcription-view-store";
import { useTranscriptionStore } from "../store/transcription-view-store";

interface SegmentRowProps {
  segment: TranscriptionSegment;
  index: number;
  speakers: Speaker[];
  isEditing: boolean;
  isActive: boolean;
  isSearchMatch: boolean;
  isCurrentSearchMatch: boolean;
  isSpeakerDiarized: boolean;
  searchTerm?: string;
  showSearch?: boolean;
  onSegmentClick: (index: number) => void;
  onTextChange: (index: number, value: string) => void;
  onSpeakerChange: (index: number, speakerIndex: number | null) => void;
}

function highlightText(text: string, term: string, isCurrent: boolean) {
  if (!term) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className={cn(
              "rounded px-0.5 font-medium transition-colors",
              isCurrent 
                ? "bg-yellow-400 text-slate-900 dark:bg-yellow-500 shadow-sm" 
                : "bg-yellow-200/80 text-slate-900 dark:bg-yellow-600/50 dark:text-slate-100"
            )}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export const SegmentRow = memo(function SegmentRow({
  segment,
  index,
  speakers,
  isEditing,
  isActive,
  isSearchMatch,
  isCurrentSearchMatch,
  isSpeakerDiarized,
  searchTerm,
  showSearch,
  onSegmentClick,
  onTextChange,
  onSpeakerChange,
}: SegmentRowProps) {
  const addSpeaker = useTranscriptionStore((state) => state.addSpeaker);

  const speakerLabel =
    segment.speakerIndex !== null
      ? (speakers.find((s) => s.index === segment.speakerIndex)?.label ?? `Speaker ${segment.speakerIndex}`)
      : null;

  const rowClass = [
    "group px-2 py-1.5 rounded-md transition-colors duration-150",
    isActive
      ? "bg-teal-50 dark:bg-teal-900/25 ring-1 ring-teal-200 dark:ring-teal-800"
      : isCurrentSearchMatch
        ? "bg-yellow-50 dark:bg-yellow-900/20 ring-1 ring-yellow-200 dark:ring-yellow-800"
        : isSearchMatch
          ? "bg-slate-50 dark:bg-slate-800/30"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/10",
  ].join(" ");

  return (
    <div
      id={`segment-${index}`}
      className={cn(
        "group rounded-xl transition-all duration-300 border-2 relative overflow-hidden",
        isActive
          ? "bg-teal-50/70 dark:bg-teal-900/30 border-teal-500/40 dark:border-teal-400/30 shadow-md ring-1 ring-teal-500/10"
          : isCurrentSearchMatch
          ? "bg-yellow-50/80 dark:bg-yellow-900/30 border-yellow-500/50 dark:border-yellow-400/40 shadow-sm"
          : "bg-transparent border-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40 hover:border-slate-200/50 dark:hover:border-slate-700/50",
        !isEditing && "cursor-pointer active:scale-[0.995]"
      )}
      onClick={() => !isEditing && onSegmentClick(index)}
    >
      {/* Active Accent Bar */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600 dark:bg-teal-500 shadow-[0_0_10px_rgba(13,148,136,0.5)]" />
      )}
      {isCurrentSearchMatch && !isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-500 dark:bg-yellow-600 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
      )}
      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3">
        {/* Sidebar: timestamp + optional speaker */}
        <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 shrink-0 w-20">
          <span className={cn(
            "font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded",
            isActive 
              ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          )}>
            {formatTimeMMSS(segment.start)}
          </span>

          {isSpeakerDiarized && (
            <div className="h-6 sm:h-5 mt-1 flex items-center">
              {isEditing ? (
                <Select
                  value={segment.speakerIndex?.toString() ?? "none"}
                  onValueChange={(val) => {
                    if (val === "add-new") {
                      const newIndex = addSpeaker();
                      onSpeakerChange(index, newIndex);
                    } else {
                      onSpeakerChange(index, val === "none" ? null : Number(val));
                    }
                  }}
                >
                  <SelectTrigger className={cn(
                    "h-5 text-[10px] border-0 bg-transparent shadow-none p-0 focus:ring-0 w-full sm:w-auto gap-1.5 font-bold uppercase tracking-wider transition-colors",
                    segment.speakerIndex === null ? "text-muted-foreground/40 hover:text-muted-foreground/60" : "text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                  )}>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        segment.speakerIndex === null ? "bg-muted-foreground/20" : "bg-teal-500/50"
                      )} />
                      <SelectValue placeholder="No speaker" />
                    </div>
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-[140px]">
                    <SelectItem value="none" className="text-[11px]">No speaker</SelectItem>
                    {speakers.map((s) => (
                      <SelectItem key={s.index} value={s.index.toString()} className="text-[11px]">
                        {s.label}
                      </SelectItem>
                    ))}
                    <Separator className="my-1" />
                    <SelectItem value="add-new" className="text-[11px] text-teal-600 dark:text-teal-400 font-bold focus:text-teal-600 focus:bg-teal-50 dark:focus:bg-teal-900/30">
                      <div className="flex items-center gap-2">
                        <Plus className="h-3 w-3" />
                        <span>Add Speaker</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                speakerLabel ? (
                  <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider truncate w-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 shrink-0" />
                    {speakerLabel}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wider truncate w-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 shrink-0" />
                    No Speaker
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <textarea
              value={segment.text}
              onChange={(e) => onTextChange(index, e.target.value)}
              rows={Math.max(1, Math.ceil(segment.text.length / 80))}
              className="w-full text-sm sm:text-base bg-transparent border-0 outline-none resize-none focus:ring-0 leading-relaxed p-0 text-foreground placeholder:text-muted-foreground -mt-[1px]"
              placeholder="Enter segment text..."
            />
          ) : (
            <p className={cn(
              "text-sm sm:text-base leading-relaxed text-foreground transition-colors",
              isActive ? "text-foreground font-medium" : "text-foreground/90"
            )}>
              {showSearch && searchTerm
                ? highlightText(segment.text, searchTerm, isCurrentSearchMatch)
                : segment.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});
