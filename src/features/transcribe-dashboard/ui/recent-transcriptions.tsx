"use client";

import { Clock, FileText } from "lucide-react";
import { useTranscriptionList } from "@/features/transcribe-manage/model/use-transcription-list";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function formatDuration(metadata: Record<string, unknown> | null): string {
  const dur = (metadata as { durationSeconds?: number } | null)?.durationSeconds;
  if (!dur) return "—";
  const mins = Math.floor(dur / 60);
  const secs = Math.floor(dur % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTitle(metadata: Record<string, unknown> | null, fallback: string): string {
  return (metadata as { originalFilename?: string } | null)?.originalFilename ?? fallback ?? "Untitled";
}

export function RecentTranscriptions() {
  const { data: transcriptions, isLoading } = useTranscriptionList();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const recent = (transcriptions ?? []).slice(0, 5);

  if (recent.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No transcriptions yet. Upload your first audio file!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {recent.map((item) => {
        const title = formatTitle(item.metadata, item.title);
        const duration = formatDuration(item.metadata);
        const date = item.createdAt
          ? new Date(item.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—";

        return (
          <div key={item.id} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{date}</span>
                {duration !== "—" && (
                  <>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {duration}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Badge
              variant={
                item.status === "completed"
                  ? "outline"
                  : item.status === "failed"
                    ? "destructive"
                    : "secondary"
              }
              className="text-xs capitalize flex-shrink-0"
            >
              {item.status === "queued" || item.status === "processing"
                ? "In Progress"
                : item.status}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
