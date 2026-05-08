"use client";

import type React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Download,
  FileAudio,
  MoreHorizontal,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranscriptionListStore } from "../store/transcription-list-store";
import { useTranscriptionList, type TranscriptionListItem } from "../model/use-transcription-list";
import { useDeleteTranscription } from "../model/use-delete-transcription";
import { useRetryTranscription } from "../model/use-retry-transcription";
import { useTranscriptionProgress } from "../model/use-transcription-progress";
import { toast } from "sonner";
import { type Dictionary } from "@/i18n/dictionaries";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface TranscriptionListProps {
  dict: Dictionary;
}

type TranscriptionStatus = "queued" | "processing" | "completed" | "failed";
type TranscriptionMode = "fast" | "turbo" | "super";

function mapStatus(
  status: TranscriptionStatus
): "completed" | "in_progress" | "failed" | "queued" {
  if (status === "processing" || status === "queued") return "in_progress";
  return status;
}

function mapMode(model: "small" | "turbo" | "large"): TranscriptionMode {
  if (model === "small") return "fast";
  if (model === "large") return "super";
  return "turbo";
}

function formatDuration(metadata: Record<string, unknown> | null, status: string): string {
  const dur = (metadata as { durationSeconds?: number } | null)?.durationSeconds;
  if (!dur || dur === 0) {
    return status === "completed" ? "00:00" : "-";
  }
  const mins = Math.floor(dur / 60);
  const secs = Math.floor(dur % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTitle(metadata: Record<string, unknown> | null, fallback: string): string {
  return (metadata as { originalFilename?: string } | null)?.originalFilename ?? fallback ?? "Untitled";
}

function TranscriptionListItemRow({
  item,
  index,
  onSelect,
  onDelete,
  onRetry,
  isDeleting,
  isRetrying,
  dict,
}: {
  item: TranscriptionListItem;
  index: number;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRetry: (id: string, e: React.MouseEvent) => void;
  isDeleting: boolean;
  isRetrying: boolean;
  dict: any;
}) {
  const displayTitle = formatTitle(item.metadata, item.title);
  const displayMode = mapMode(item.model);

  // Hook up to live progress if it's currently processing
  const liveProgress = useTranscriptionProgress(item.id, item.status);
  
  const currentStatus = liveProgress?.status ?? item.status;
  const displayStatus = mapStatus(currentStatus as TranscriptionStatus);
  const displayDuration = formatDuration(item.metadata, currentStatus);
  const currentProgressPercent = liveProgress?.progress ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer gap-4 group/item"
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800">
          <FileAudio className="h-5 w-5 text-slate-500" />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium truncate">{displayTitle}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "—"}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {displayDuration}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
        {displayStatus === "in_progress" && (
          <div className="flex-1 sm:w-24 sm:flex-none mr-2">
            <Progress value={currentProgressPercent} className="h-2" />
            <p className="text-[10px] text-right mt-1 text-muted-foreground">
              {currentProgressPercent}%
            </p>
          </div>
        )}

        <Badge
          variant={
            displayMode === "fast"
              ? "outline"
              : displayMode === "turbo"
                ? "secondary"
                : "default"
          }
          className="text-xs font-normal capitalize"
        >
          {dict.transcribe.form.speed[displayMode]?.label || displayMode}
        </Badge>

        <Badge
          variant={
            displayStatus === "completed"
              ? "outline"
              : displayStatus === "in_progress"
                ? "secondary"
                : "default"
          }
          className="text-xs font-normal capitalize"
        >
          {dict.status[currentStatus] || displayStatus.replace("_", " ")}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{dict.common.options || "Options"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
            >
              {dict.common.view || "View"}
            </DropdownMenuItem>
            {currentStatus === "failed" && (
              <DropdownMenuItem
                onClick={(e) => onRetry(item.id, e)}
                disabled={isRetrying}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {dict.common.retry || "Retry Job"}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-4 w-4 mr-2" />
              {dict.manage.actions.download}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10"
              onClick={(e) => onDelete(item.id, e)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {dict.common.delete || "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}


export function TranscriptionList({ dict }: TranscriptionListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchQuery, setSearchQuery } = useTranscriptionListStore();
  const { data: transcriptions, isLoading, error } = useTranscriptionList();
  const deleteMutation = useDeleteTranscription();
  const retryMutation = useRetryTranscription();

  const handleSelect = (id: string) => {
    router.push(`/dashboard/manage/${id}`, { scroll: false });
  };

  const filteredTranscriptions = (transcriptions ?? []).filter((item) => {
    const title = formatTitle(item.metadata, item.title).toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query);
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(dict.manage.messages.deleteSuccess);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : dict.manage.error);
      },
    });
  };

  const handleRetry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    retryMutation.mutate(id, {
      onSuccess: () => {
        toast.success(dict.manage.messages.retrySuccess || "Transcription queued for retry");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : dict.manage.error);
      },
    });
  };

  return (
    <Card className="md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50 md:bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl sm:text-2xl">{dict.manage.title}</CardTitle>
        <CardDescription>
          {dict.manage.description || "Manage and view all your transcriptions"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 sm:px-6 py-2 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={dict.manage.search}
              className="pl-8 pr-8 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" className="h-9 shrink-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
            {dict.manage.filter || "Filter"}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px]">
          <div className="p-4 sm:p-6 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="text-sm text-muted-foreground">
                  {dict.common.loading}
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-20 px-4">
                <p className="text-destructive font-medium">
                  {error instanceof Error ? error.message : dict.manage.error}
                </p>
              </div>
            ) : filteredTranscriptions.length > 0 ? (
              filteredTranscriptions.map((item, index) => (
                <TranscriptionListItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  onRetry={handleRetry}
                  isDeleting={deleteMutation.isPending}
                  isRetrying={retryMutation.isPending}
                  dict={dict}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 opacity-50">
                <FileAudio className="h-12 w-12 stroke-[1px]" />
                <p className="text-sm">
                  {searchQuery ? dict.manage.noResults : (dict.manage.noTranscriptions || "No transcriptions yet")}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
