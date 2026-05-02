"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Clock,
  Download,
  FileAudio,
  Pencil,
  RotateCcw,
  Save,
  Share2,
  Trash2,
  Zap,
  BarChart2,
  CheckCircle2,
  Copy,
  FileText,
  FileCode,
  Check,
  ChevronDown,
  Search,
  Replace,
  X,
  Play,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useTranscriptionStore } from "../store/transcription-view-store";
import { useTranscription } from "../model/use-transcription";
import { useDeleteTranscription } from "../model/use-delete-transcription";
import { useRetryTranscription } from "../model/use-retry-transcription";
import { useSaveSegments } from "../model/use-save-segments";
import { formatSrtTime, formatTime } from "@/lib/utils";
import { WaveformPlayer, type WaveformPlayerRef } from "./waveform-player";
import { useTranscriptionProgress } from "../model/use-transcription-progress";

interface TranscriptionViewProps {
  id: string;
  onBack: () => void;
}

export function TranscriptionView({ id, onBack }: TranscriptionViewProps) {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const userScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<WaveformPlayerRef | null>(null);

  // TanStack Query hooks
  const { data: transcriptionData, isLoading } = useTranscription(id);
  const deleteMutation = useDeleteTranscription();
  const retryMutation = useRetryTranscription();
  const saveSegmentsMutation = useSaveSegments(id);
  const queryClient = useQueryClient();

  const liveProgress = useTranscriptionProgress(id, transcriptionData?.status ?? "processing");

  // Zustand store — UI-only state + editable local copy of segments
  const {
    segments,
    metadata,
    isEditing,
    isCopied,
    showSearch,
    searchTerm,
    replaceTerm,
    searchResults,
    currentResultIndex,

    initializeFromData,
    setIsEditing,
    setIsCopied,
    setShowSearch,
    setSearchTerm,
    setReplaceTerm,

    updateSegment,

    getFullTranscript,
    performSearch,
    replaceCurrentOccurrence,
    replaceAllOccurrences,
    navigateSearchResults,
  } = useTranscriptionStore();

  // Hydrate Zustand store when TanStack Query resolves
  useEffect(() => {
    if (transcriptionData) {
      initializeFromData(transcriptionData);
    }
  }, [transcriptionData, initializeFromData]);

  // Fetch presigned audio URL separately
  useEffect(() => {
    if (!id) return;
    fetch(`/api/transcription/${id}/audio`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.url) {
          setAudioUrl(data.url);
        } else {
          console.error("Failed to load audio URL:", data.error);
        }
      })
      .catch(console.error);
  }, [id]);

  // Find the active segment based on current playback time
  const findActiveSegment = useCallback(
    (currentTime: number) => {
      if (!segments || segments.length === 0) return null;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const nextSegment = i < segments.length - 1 ? segments[i + 1] : null;

        const segmentStart = segment.start / 1000;
        const segmentEnd = nextSegment
          ? nextSegment.start / 1000
          : segment.end / 1000;

        if (currentTime >= segmentStart && currentTime < segmentEnd) {
          return i;
        }
      }

      if (currentTime >= segments[segments.length - 1].start / 1000) {
        return segments.length - 1;
      }

      return null;
    },
    [segments]
  );

  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      const newActiveSegment = findActiveSegment(currentTime);
      if (newActiveSegment !== null && newActiveSegment !== activeSegmentIndex) {
        setActiveSegmentIndex(newActiveSegment);
      }
    },
    [activeSegmentIndex, findActiveSegment]
  );

  // Scroll to active segment
  useEffect(() => {
    if (
      activeSegmentIndex !== null &&
      !isEditing &&
      isPlaying &&
      !userScrollRef.current &&
      transcriptContainerRef.current &&
      segmentRefs.current[activeSegmentIndex]
    ) {
      const activeSegment = segmentRefs.current[activeSegmentIndex];
      if (activeSegment) {
        activeSegment.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeSegmentIndex, isEditing, isPlaying]);

  // Handle user scroll
  useEffect(() => {
    const handleScroll = () => {
      userScrollRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        userScrollRef.current = false;
      }, 5000);
    };

    const container = transcriptContainerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleSegmentClick = (index: number) => {
    if (isEditing) return;
    const segment = segments[index];
    if (segment) {
      setActiveSegmentIndex(index);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.jumpToTime(segment.start / 1000);
      }
    }
  };

  // Effect to handle search when searchTerm changes
  useEffect(() => {
    if (showSearch && searchTerm.trim()) {
      performSearch();
    }
  }, [showSearch, searchTerm, performSearch]);

  const handleCopyToClipboard = () => {
    const transcriptText = getFullTranscript();
    navigator.clipboard
      .writeText(transcriptText)
      .then(() => {
        setIsCopied(true);
        toast.success("Transcript copied to clipboard");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy transcript to clipboard");
      });
  };

  const handleDownloadPlainText = () => {
    const transcriptText = getFullTranscript();
    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata?.title.replace(/\s+/g, "_") || "transcript"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const handleDownloadSRT = () => {
    let srtContent = "";
    let counter = 1;

    segments.forEach((segment) => {
      const startTime = formatSrtTime(segment.start);
      const endTime = formatSrtTime(segment.end);
      srtContent += `${counter}\n${startTime} --> ${endTime}\n${segment.speaker}: ${segment.text}\n\n`;
      counter++;
    });

    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata?.title.replace(/\s+/g, "_") || "transcript"}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  const highlightSearchTerm = (text: string, isCurrentResult: boolean) => {
    if (!searchTerm || !showSearch) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, i) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <span
            key={i}
            className={`${isCurrentResult ? "bg-yellow-300 dark:bg-yellow-800" : "bg-yellow-100 dark:bg-yellow-900"}`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleNavigateSearchResults = (direction: "next" | "prev") => {
    navigateSearchResults(direction);
    if (!isEditing && searchResults.length > 0) {
      const element = document.getElementById(
        `segment-${searchResults[currentResultIndex]}`
      );
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSearch = () => {
    const results = performSearch();
    if (!results || results.length === 0) {
      toast.info(`No matches found for "${searchTerm}"`);
    } else {
      toast.info(`Found ${results.length} matches for "${searchTerm}"`);
      if (results.length > 0 && !isEditing) {
        const element = document.getElementById(`segment-${results[0]}`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleReplaceAll = () => {
    replaceAllOccurrences();
    toast.success(
      `Replaced ${searchResults.length} occurrences of "${searchTerm}" with "${replaceTerm}"`
    );
  };

  const handleSaveChanges = () => {
    saveSegmentsMutation.mutate(
      segments.map((s) => ({ id: s.id, text: s.text, speaker: s.speaker })),
      {
        onSuccess: () => {
          toast.success("Changes saved successfully");
          setIsEditing(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to save changes");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Re-initialize from cached query data to discard local edits
    if (transcriptionData) {
      initializeFromData(transcriptionData);
    }
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this transcription?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Transcription deleted");
        onBack();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete transcription"
        );
      },
    });
  };

  // Invalidate and re-fetch when SSE signals completion
  const invalidateTranscription = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transcription", id] });
  }, [queryClient, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!metadata) return null;

  const currentStatus = liveProgress?.status === "pending" || liveProgress?.status === "processing"
    ? "in_progress"
    : liveProgress?.status ?? metadata.status;

  const currentProgress = liveProgress?.progress ?? metadata.progress;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-1"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <CardTitle>{metadata.title}</CardTitle>
            </div>
            <CardDescription>
              <div className="flex items-center gap-3 text-sm">
                <span>{metadata.date}</span>
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {metadata.duration}
                </span>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      metadata.mode === "fast"
                        ? "outline"
                        : metadata.mode === "medium"
                          ? "secondary"
                          : "default"
                    }
                    className="text-xs font-normal capitalize flex items-center gap-1"
                  >
                    {metadata.mode === "fast" && <Zap className="h-3 w-3" />}
                    {metadata.mode === "medium" && (
                      <BarChart2 className="h-3 w-3" />
                    )}
                    {metadata.mode === "super" && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {metadata.mode}
                  </Badge>

                  <Badge
                variant={
                  currentStatus === "completed"
                    ? "outline"
                    : currentStatus === "in_progress"
                      ? "secondary"
                      : "default"
                }
                className="capitalize"
              >
                {currentStatus.replace("_", " ")}
              </Badge>
                </div>
              </div>
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Download dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                  <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyToClipboard}>
                  {isCopied ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy to clipboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPlainText}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download as plain text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadSRT}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Download as SRT
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search button */}
            <Button
              variant={showSearch ? "default" : "outline"}
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>

            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {currentStatus === "in_progress" && (
          <div className="px-6 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {liveProgress?.message || "Processing transcription"}
              </span>
              <span className="text-sm font-medium">{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metadata.mode === "fast"
                ? "Fast processing - lower accuracy but quicker results"
                : metadata.mode === "medium"
                  ? "Medium processing - balanced accuracy and speed"
                  : "Super processing - highest accuracy with longer processing time"}
            </p>
          </div>
        )}

        <CardContent>
          {/* Audio Player */}
          <div className="mb-4 p-3 border rounded-md bg-slate-50 dark:bg-slate-900">
            {audioUrl ? (
              <WaveformPlayer
                ref={audioPlayerRef}
                audioUrl={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="h-10 flex items-center justify-center text-sm text-muted-foreground">
                Loading audio...
              </div>
            )}
          </div>

          {/* Search and replace UI */}
          {showSearch && (
            <div className="mb-4 p-3 border rounded-md bg-slate-50 dark:bg-slate-900">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search text..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                    />
                  </div>
                  <Button size="sm" variant="secondary" onClick={handleSearch}>
                    Find
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSearch(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <Replace className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Replace with..."
                      value={replaceTerm}
                      onChange={(e) => setReplaceTerm(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={replaceCurrentOccurrence}
                    disabled={searchResults.length === 0}
                  >
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleReplaceAll}
                    disabled={searchResults.length === 0}
                  >
                    Replace All
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">
                      {currentResultIndex + 1} of {searchResults.length} matches
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => handleNavigateSearchResults("prev")}
                        disabled={searchResults.length <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => handleNavigateSearchResults("next")}
                        disabled={searchResults.length <= 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Tabs defaultValue="transcript" className="space-y-4">
            <TabsList>
              <TabsTrigger
                value="transcript"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Transcript
              </TabsTrigger>
              <TabsTrigger
                value="summary"
                className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
              >
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileAudio className="h-4 w-4" />
                  <span>Full transcript • {metadata.duration}</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs flex items-center gap-1"
                  onClick={handleCopyToClipboard}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div
                ref={transcriptContainerRef}
                className="border rounded-md p-4 h-[400px] overflow-y-auto"
              >
                {currentStatus === "in_progress" ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin mb-4" />
                    <p>{liveProgress?.message || "Transcription is currently processing..."}</p>
                    <p className="text-xs">Please check back later.</p>
                  </div>
                ) : currentStatus === "failed" ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-500">
                    <AlertCircle className="w-8 h-8 mb-4" />
                    <p>Transcription failed to process.</p>
                    <p className="text-xs">You can retry this transcription from the options below.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {segments.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-slate-500">
                        <p>No transcript segments available.</p>
                      </div>
                    ) : (
                      segments.map((segment, index) => (
                        <div
                          key={index}
                          ref={(el) => {
                            if (el) segmentRefs.current[index] = el;
                          }}
                      className={`group p-2 rounded-md transition-colors duration-200 ${
                        activeSegmentIndex === index
                          ? "bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800"
                          : searchResults.includes(index) &&
                              searchResults[currentResultIndex] === index
                            ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                            : searchResults.includes(index)
                              ? "bg-slate-50 dark:bg-slate-800/30"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/10"
                      }`}
                      id={`segment-${index}`}
                      onClick={() => !isEditing && handleSegmentClick(index)}
                      style={{ cursor: isEditing ? "default" : "pointer" }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-24 text-xs text-slate-500 dark:text-slate-400 pt-1 font-mono">
                          {formatTime(segment.start)}
                        </div>
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              {segment.speaker && (
                                <Input
                                  value={segment.speaker}
                                  onChange={(e) =>
                                    updateSegment(index, "speaker", e.target.value)
                                  }
                                  className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400"
                                />
                              )}
                              <textarea
                                value={segment.text}
                                onChange={(e) =>
                                  updateSegment(index, "text", e.target.value)
                                }
                                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400 min-h-[60px]"
                              />
                            </div>
                          ) : (
                            <>
                              {!isEditing && segment.speaker && (
                                <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                  {segment.speaker}
                                </div>
                              )}
                              <p className="text-sm">
                                {showSearch && searchTerm
                                  ? highlightSearchTerm(
                                      segment.text,
                                      searchResults[currentResultIndex] === index
                                    )
                                  : segment.text}
                              </p>
                            </>
                          )}
                        </div>
                        {/* Play button for each segment */}
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSegmentClick(index);
                            }}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        {/* Edit controls for each segment */}
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              // Segment-specific actions if needed
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                </div>
              )}
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="border rounded-md p-4 h-[400px] overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {metadata.summary}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <div className="flex items-center gap-2">
            {currentStatus === "failed" && (
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => retryMutation.mutate(id, {
                  onSuccess: () => {
                    toast.success("Transcription queued for retry");
                    onBack();
                  },
                  onError: (err) => {
                    toast.error(err instanceof Error ? err.message : "Failed to retry");
                  }
                })}
                disabled={retryMutation.isPending}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Job
              </Button>
            )}
            
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={saveSegmentsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveSegmentsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Export for use in SSE invalidation if needed
export type { TranscriptionViewProps };
