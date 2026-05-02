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
import { useTranscriptionListStore } from "../store/transcription-list-store";
import { useTranscriptionList, type TranscriptionListItem } from "../model/use-transcription-list";
import { useDeleteTranscription } from "../model/use-delete-transcription";
import { useRetryTranscription } from "../model/use-retry-transcription";
import { useTranscriptionProgress } from "../model/use-transcription-progress";
import { toast } from "sonner";

interface TranscriptionListProps {
  onSelect: (id: string) => void;
}

type TranscriptionStatus = "queued" | "processing" | "completed" | "failed";
type TranscriptionMode = "fast" | "medium" | "super";

function mapStatus(
  status: TranscriptionStatus
): "completed" | "in_progress" | "failed" | "queued" {
  if (status === "processing" || status === "queued") return "in_progress";
  return status;
}

function mapMode(model: "small" | "medium" | "large"): TranscriptionMode {
  if (model === "small") return "fast";
  if (model === "large") return "super";
  return "medium";
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
}: {
  item: TranscriptionListItem;
  index: number;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRetry: (id: string, e: React.MouseEvent) => void;
  isDeleting: boolean;
  isRetrying: boolean;
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
      className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800">
          <FileAudio className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <h3 className="font-medium">{displayTitle}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "No date"}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {displayDuration}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {displayStatus === "in_progress" && (
          <div className="w-24 mr-2">
            <Progress value={currentProgressPercent} className="h-2" />
            <p className="text-xs text-right mt-1 text-muted-foreground">
              {currentProgressPercent}%
            </p>
          </div>
        )}

        <Badge
          variant={
            displayMode === "fast"
              ? "outline"
              : displayMode === "medium"
                ? "secondary"
                : "default"
          }
          className="text-xs font-normal capitalize"
        >
          {displayMode}
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
          {displayStatus.replace("_", " ")}
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
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item.id);
              }}
            >
              View
            </DropdownMenuItem>
            {currentStatus === "failed" && (
              <DropdownMenuItem
                onClick={(e) => onRetry(item.id, e)}
                disabled={isRetrying}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10"
              onClick={(e) => onDelete(item.id, e)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export function TranscriptionList({ onSelect }: TranscriptionListProps) {
  const { searchQuery, setSearchQuery } = useTranscriptionListStore();
  const { data: transcriptions, isLoading, error } = useTranscriptionList();
  const deleteMutation = useDeleteTranscription();
  const retryMutation = useRetryTranscription();

  const filteredTranscriptions = (transcriptions ?? []).filter((item) => {
    const title = formatTitle(item.metadata, item.title).toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query);
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Transcription deleted successfully");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete transcription");
      },
    });
  };

  const handleRetry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    retryMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Transcription queued for retry");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to retry transcription");
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Transcriptions</CardTitle>
          <CardDescription>
            Manage and view all your transcriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transcriptions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">Filter</Button>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Loading transcriptions...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">
                    {error instanceof Error ? error.message : "Failed to load transcriptions"}
                  </p>
                </div>
              ) : filteredTranscriptions.length > 0 ? (
                filteredTranscriptions.map((item, index) => (
                  <TranscriptionListItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    onSelect={onSelect}
                    onDelete={handleDelete}
                    onRetry={handleRetry}
                    isDeleting={deleteMutation.isPending}
                    isRetrying={retryMutation.isPending}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No transcriptions found
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
