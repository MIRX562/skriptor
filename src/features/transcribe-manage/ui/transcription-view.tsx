"use client";

import { useRef, useEffect, useState, useCallback, memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Clock,
  Download,
  Pencil,
  Save,
  Trash2,
  FileText,
  ChevronDown,
  Search,
  LayoutList,
  Type,
  Users,
  RefreshCcw,
  SpellCheck,
  AlertCircle,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRouter, useSearchParams } from "next/navigation";

import { useTranscriptionStore } from "../store/transcription-view-store";
import { useTranscription } from "../model/use-transcription";
import { useDeleteTranscription } from "../model/use-delete-transcription";
import { useRetryTranscription } from "../model/use-retry-transcription";
import { useSaveSegments } from "../model/use-save-segments";
import { cn } from "@/lib/utils";
import { WaveformPlayer, type WaveformPlayerRef } from "./waveform-player";
import { useTranscriptionProgress } from "../model/use-transcription-progress";
import { SegmentRow } from "./segment-row";
import { DownloadOptions } from "./DownloadOptions";
import { SearchControls } from "./search-controls";
import { FloatingToolbar } from "./floating-toolbar";
import { RetranscribeDialog } from "./RetranscribeDialog";
import { type Dictionary } from "@/i18n/dictionaries";
import { useSettingsStore } from "@/features/setting/store/settings-store";
import { useSpellcheckStore } from "../store/spellcheck-store";
import { SpellcheckHighlighter } from "./spellcheck-highlighter";
import { SpellcheckReview } from "./spellcheck-review";

interface TranscriptionViewProps {
  id: string;
  dict: Dictionary;
}

export function TranscriptionView({ id, dict }: TranscriptionViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpellcheckReviewOpen, setIsSpellcheckReviewOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<WaveformPlayerRef | null>(null);

  // TanStack Query hooks
  const { data: transcriptionData, isLoading } = useTranscription(id);
  const deleteMutation = useDeleteTranscription();
  const saveSegmentsMutation = useSaveSegments(id);

  const liveProgress = useTranscriptionProgress(id, transcriptionData?.status ?? "processing");

  // Zustand store
  const {
    segments,
    speakers,
    metadata,
    isEditing,
    showSearch,
    searchTerm,
    searchResults,
    currentResultIndex,
    viewMode,

    initializeFromData,
    setIsEditing,
    setIsCopied,
    setShowSearch,
    setViewMode,

    updateSegment,
    updateSpeakerLabel,
    getSpeakerLabel,
    getFullTranscript,
    clearSearch
  } = useTranscriptionStore();

  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const {
    isEnabled: isSpellcheckEnabled,
    toggleEnabled: toggleSpellcheck,
    isLoading: isSpellcheckLoading,
    setLanguage: setSpellcheckLanguage
  } = useSpellcheckStore();

  const [isSpeakerDialogOpen, setIsSpeakerDialogOpen] = useState(false);

  const handleBack = () => {
    router.push("/dashboard/manage", { scroll: false });
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Set spellcheck language when transcriptionData is loaded
  useEffect(() => {
    if (transcriptionData?.language) {
      setSpellcheckLanguage(transcriptionData.language);
    }
  }, [transcriptionData?.language, setSpellcheckLanguage]);

  // Hydrate Zustand store when TanStack Query resolves
  useEffect(() => {
    if (transcriptionData) {
      initializeFromData(transcriptionData);
    }
  }, [transcriptionData, initializeFromData]);

  // Fetch presigned URL for playback
  useEffect(() => {
    if (!id) return;
    fetch(`/api/transcription/${id}/audio`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.url) {
          setAudioUrl(data.url);
        }
      })
      .catch((err) => console.error("Failed to fetch audio url", err));
  }, [id]);

  const findActiveSegment = useCallback(
    (currentTime: number) => {
      if (!segments || segments.length === 0) return null;
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const nextSegment = i < segments.length - 1 ? segments[i + 1] : null;
        const segmentStart = segment.start / 1000;
        const segmentEnd = nextSegment ? nextSegment.start / 1000 : segment.end / 1000;
        if (currentTime >= segmentStart && currentTime < segmentEnd) return i;
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

  const rowVirtualizer = useVirtualizer({
    count: segments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  // Scroll to active segment
  useEffect(() => {
    if (activeSegmentIndex !== null && isPlaying) {
      if (viewMode === "segments") {
        rowVirtualizer.scrollToIndex(activeSegmentIndex, { align: "center", behavior: "auto" });
      } else if (viewMode === "fulltext") {
        const element = document.getElementById(`read-segment-${activeSegmentIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
      }
    }
  }, [activeSegmentIndex, isPlaying, viewMode, rowVirtualizer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in any input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        isEditing
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        audioPlayerRef.current?.togglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        audioPlayerRef.current?.skipBackward();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        audioPlayerRef.current?.skipForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing]);

  // Recalculate virtualizer when switching back to segments mode
  useEffect(() => {
    if (viewMode === "segments") {
      rowVirtualizer.measure();
    }
  }, [viewMode, rowVirtualizer]);

  // Scroll to current search result
  useEffect(() => {
    if (searchResults.length > 0 && currentResultIndex >= 0 && showSearch) {
      const matchIndex = searchResults[currentResultIndex];
      if (viewMode === "segments") {
        rowVirtualizer.scrollToIndex(matchIndex, { align: "center", behavior: "smooth" });
      } else if (viewMode === "fulltext") {
        const element = document.getElementById(`read-segment-${matchIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [searchResults, currentResultIndex, viewMode, rowVirtualizer, showSearch]);

  const handleSegmentClick = (index: number) => {
    if (isEditing) return;
    const segment = segments[index];
    if (segment && audioPlayerRef.current) {
      audioPlayerRef.current.jumpToTime(segment.start / 1000);
      if (viewMode === "segments") {
        rowVirtualizer.scrollToIndex(index, { align: "center", behavior: "smooth" });
      }
    }
  };

  const handleGoToSegment = useCallback((index: number) => {
    const segment = segments[index];
    if (segment && audioPlayerRef.current) {
      audioPlayerRef.current.jumpToTime(segment.start / 1000);
      if (viewMode === "segments") {
        rowVirtualizer.scrollToIndex(index, { align: "center", behavior: "smooth" });
      } else if (viewMode === "fulltext") {
        const element = document.getElementById(`read-segment-${index}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      setActiveSegmentIndex(index);
    }
  }, [segments, viewMode, rowVirtualizer]);


  const handleCopyToClipboard = () => {
    const text = getFullTranscript();
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      toast.success(dict.view.messages.copySuccess);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleSaveChanges = () => {
    saveSegmentsMutation.mutate(
      {
        segments: segments.map((s) => ({ id: s.id, text: s.text, speakerIndex: s.speakerIndex })),
        speakers: speakers,
      },
      {
        onSuccess: () => {
          toast.success(dict.view.messages.saveSuccess);
          setIsEditing(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : dict.view.messages.saveError);
        },
      }
    );
  };

  const handleDelete = () => {
    toast(dict.view.messages.confirmDelete, {
      description: dict.view.messages.confirmDeleteDescription,
      action: {
        label: dict.common.delete,
        onClick: () => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              toast.success(dict.view.messages.deleteSuccess);
              handleBack();
            },
          });
        },
      },
    });
  };

  const handleSearchClose = useCallback(() => {
    clearSearch();
    setShowSearch(false);
  }, [clearSearch, setShowSearch]);

  if (isLoading || !metadata || metadata.id !== id) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>;

  // Determine status: prioritize completed/failed from database. 
  // If database says it's in_progress, check live progress for details.
  const isCompletedInDb = metadata.status === "completed" || metadata.status === "failed";
  const currentStatus = isCompletedInDb 
    ? metadata.status 
    : (liveProgress?.status === "pending" || liveProgress?.status === "processing") 
      ? "in_progress" 
      : metadata.status;

  const currentProgress = isCompletedInDb ? 100 : (liveProgress?.progress ?? 0);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden pt-0 md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50 md:bg-card">
        <CardHeader className="flex flex-row items-center justify-between gap-1 sm:gap-2 p-3 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full" 
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-base sm:text-lg md:text-xl font-bold truncate">
                {metadata.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{metadata.date}</span>
                <span className="opacity-30">•</span>
                <span>{metadata.duration}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 sm:h-9 shrink-0 bg-white dark:bg-slate-950 px-2 sm:px-3" 
              asChild
            >
              <a href={`/api/transcription/${id}/audio?download=true`} download title={dict.view.download?.originalAudio || "Download Audio"}>
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:mr-2 text-teal-600" />
                <span className="hidden md:inline">{dict.view.download?.originalAudio || "Audio"}</span>
              </a>
            </Button>

            <RetranscribeDialog 
              id={id} 
              dict={dict} 
              currentSettings={{
                language: transcriptionData?.language || "en",
                model: transcriptionData?.model || "turbo",
                isSpeakerDiarized: transcriptionData?.isSpeakerDiarized || false,
                numberOfSpeaker: transcriptionData?.numberOfSpeaker || 1,
              }}
              trigger={
                <Button variant="outline" size="sm" className="h-8 sm:h-9 shrink-0 bg-white dark:bg-slate-950 px-2 sm:px-3">
                  <RefreshCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:mr-2 text-teal-600" />
                  <span className="hidden md:inline">{dict.view.actions?.retranscribe || "Re-transcribe"}</span>
                </Button>
              }
            />

            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 sm:h-9 shrink-0 text-destructive hover:bg-destructive/10 bg-white dark:bg-slate-950 border-destructive/20 px-2 sm:px-3" 
              onClick={handleDelete} 
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:mr-2" />
              <span className="hidden md:inline">{dict.view.actions.delete || "Delete"}</span>
            </Button>
          </div>
        </CardHeader>

        {currentStatus === "in_progress" && (
          <div className="px-6 py-3 bg-teal-50/30 dark:bg-teal-900/10 border-b border-teal-100 dark:border-teal-900/30">
            <div className="flex justify-between text-[10px] sm:text-xs mb-1.5 font-medium text-teal-700 dark:text-teal-400">
              <span>{liveProgress?.message || dict.view.processing.message}</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-1.5 bg-teal-100 dark:bg-teal-950" />
          </div>
        )}

        <CardContent className="space-y-4 p-4 sm:p-6">
          <div id="waveform-player" className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 shadow-inner">
            {audioUrl ? (
              <MemoizedWaveformPlayer 
                ref={audioPlayerRef} 
                audioUrl={audioUrl} 
                onTimeUpdate={handleTimeUpdate} 
                onPlay={() => setIsPlaying(true)} 
                onPause={() => setIsPlaying(false)} 
                dict={dict} 
              />
            ) : (
              <div className="h-12 flex items-center justify-center text-sm text-muted-foreground italic">
                {dict.view.loadingAudio}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar max-w-full">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
                <TabsList className="flex h-8 p-0 bg-transparent border-none shadow-none">
                  <TabsTrigger 
                    value="segments" 
                    className="text-xs h-7 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 shadow-none data-[state=active]:shadow-sm"
                  >
                    <LayoutList className="h-3.5 w-3.5 md:mr-2" />
                    <span className="hidden md:inline">{dict.view.tabs.transcript}</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="fulltext" 
                    className="text-xs h-7 px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 shadow-none data-[state=active]:shadow-sm"
                  >
                    <Type className="h-3.5 w-3.5 md:mr-2" />
                    <span className="hidden md:inline">{dict.view.tabs.readMode || "Read Mode"}</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

              <DownloadOptions 
                metadata={metadata} 
                segments={segments} 
                speakers={speakers} 
                dict={dict} 
                onCopy={handleCopyToClipboard}
                trigger={
                  <Button id="download-btn" variant="ghost" size="sm" className="h-8 shrink-0 hover:bg-white dark:hover:bg-slate-950">
                    <Download className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">{dict.view.actions.download}</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                }
              />

              <Button 
                id="search-btn"
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 shrink-0 hover:bg-white dark:hover:bg-slate-950",
                  showSearch && "bg-white text-teal-600 dark:bg-slate-950 dark:text-teal-400 shadow-sm"
                )}
                onClick={() => {
                  if (showSearch) {
                    clearSearch();
                  }
                  setShowSearch(!showSearch);
                }}
              >
                <Search className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{dict.view.actions.search}</span>
              </Button>

              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

              <Button 
                id="spellcheck-btn"
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 shrink-0 hover:bg-white dark:hover:bg-slate-950",
                  isSpellcheckEnabled && "bg-white text-teal-600 dark:bg-slate-950 dark:text-teal-400 shadow-sm"
                )}
                onClick={toggleSpellcheck}
                disabled={isSpellcheckLoading}
              >
                <SpellCheck className={cn("h-4 w-4 md:mr-2", isSpellcheckLoading && "animate-pulse")} />
                <span className="hidden md:inline">Spellcheck</span>
              </Button>

              {isSpellcheckEnabled && (
                <Button 
                  id="review-errors-btn"
                  variant="ghost" 
                  size="sm" 
                  className="h-8 shrink-0 hover:bg-white dark:hover:bg-slate-950 text-teal-600 dark:text-teal-400 font-medium"
                  onClick={() => setIsSpellcheckReviewOpen(true)}
                >
                  <AlertCircle className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Review Errors</span>
                </Button>
              )}

              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => setIsEditing(false)}>
                    {dict.view.actions.cancel}
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-8 bg-teal-600 hover:bg-teal-700 text-white" 
                    onClick={handleSaveChanges} 
                    disabled={saveSegmentsMutation.isPending}
                  >
                    <Save className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">{dict.view.actions.save}</span>
                  </Button>
                </>
              ) : (
                <>
                  {metadata.isSpeakerDiarized && (
                    <Dialog open={isSpeakerDialogOpen} onOpenChange={setIsSpeakerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 hover:bg-white dark:hover:bg-slate-950">
                          <Users className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">{dict.view.actions.manageSpeakers}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{dict.view.manageSpeakers.title}</DialogTitle>
                          <DialogDescription>
                            {dict.view.manageSpeakers.description}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                          {speakers.map((speaker) => (
                            <div key={speaker.index} className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor={`speaker-${speaker.index}`} className="text-right text-xs">
                                {dict.view.manageSpeakers.label.replace("{index}", speaker.index.toString())}
                              </Label>
                              <Input
                                id={`speaker-${speaker.index}`}
                                value={speaker.label}
                                onChange={(e) => updateSpeakerLabel(speaker.index, e.target.value)}
                                className="col-span-3 h-8 text-sm"
                                placeholder={dict.view.manageSpeakers.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={() => {
                              saveSegmentsMutation.mutate(
                                { segments, speakers },
                                {
                                  onSuccess: () => {
                                    toast.success(dict.view.messages.saveSuccess);
                                    setIsSpeakerDialogOpen(false);
                                  },
                                  onError: (err) => {
                                    toast.error(err instanceof Error ? err.message : dict.view.messages.saveError);
                                  }
                                }
                              );
                            }}
                            disabled={saveSegmentsMutation.isPending}
                          >
                            {saveSegmentsMutation.isPending ? dict.common.saving : dict.common.save}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Re-transcribe moved to header */}

                  <Button 
                    id="edit-btn"
                    variant="ghost" 
                    size="sm" 
                    className="h-8 hover:bg-white dark:hover:bg-slate-950" 
                    onClick={() => {
                      setIsEditing(true);
                      setViewMode("segments");
                    }}
                  >
                    <Pencil className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">{dict.view.actions.edit}</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showSearch && (
              <SearchControls 
                dict={dict} 
                onClose={handleSearchClose} 
              />
            )}
          </AnimatePresence>

          <div ref={contentRef} className="relative">
            {viewMode === "segments" ? (
              <div id="segments-container" ref={parentRef} className="h-[400px] sm:h-[600px] overflow-auto border border-slate-200 dark:border-slate-800 rounded-xl relative bg-white dark:bg-slate-950/50 shadow-inner">
                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                        padding: "4px 8px",
                      }}
                    >
                      <SegmentRow
                        index={virtualRow.index}
                        segment={segments[virtualRow.index]}
                        speakers={speakers}
                        isEditing={isEditing}
                        isActive={activeSegmentIndex === virtualRow.index}
                        isSearchMatch={searchResults.includes(virtualRow.index)}
                        isCurrentSearchMatch={searchResults[currentResultIndex] === virtualRow.index}
                        searchTerm={searchTerm}
                        showSearch={showSearch}
                        isSpeakerDiarized={transcriptionData?.isSpeakerDiarized ?? false}
                        onSegmentClick={handleSegmentClick}
                        onTextChange={(idx, val) => updateSegment(idx, "text", val)}
                        onSpeakerChange={(idx, val) => updateSegment(idx, "speakerIndex", val)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[400px] sm:h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950/50 shadow-inner">
                <div className="p-4 sm:p-8 prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-0">
                  {segments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                      <FileText className="h-10 w-10 opacity-20" />
                      <p>{dict.view.empty}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {segments.reduce((acc: any[], s, i) => {
                        const prev = i > 0 ? segments[i - 1] : null;
                        const showSpeaker = !prev || prev.speakerIndex !== s.speakerIndex;
                        
                        if (showSpeaker || acc.length === 0) {
                          acc.push({
                            speakerIndex: s.speakerIndex,
                            segments: [{ ...s, index: i }]
                          });
                        } else {
                          acc[acc.length - 1].segments.push({ ...s, index: i });
                        }
                        return acc;
                      }, []).map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-2">
                          <span className="block font-bold text-teal-600 dark:text-teal-400 text-[10px] uppercase tracking-widest mb-1">
                            {getSpeakerLabel(group.speakerIndex) || "Unknown"}
                          </span>
                          <p className="text-base sm:text-lg text-justify leading-relaxed">
                            {group.segments.map((s: any) => (
                              <span key={s.id}>
                                <span
                                  id={`read-segment-${s.index}`}
                                  onClick={() => handleSegmentClick(s.index)}
                                  className={cn(
                                    "cursor-pointer transition-all duration-300 rounded px-1 -mx-1 inline",
                                    activeSegmentIndex === s.index
                                      ? "bg-teal-200/50 dark:bg-teal-700/40 text-foreground font-semibold ring-1 ring-teal-400/30 dark:ring-teal-500/30 shadow-[0_0_15px_rgba(13,148,136,0.15)] z-10"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground/80 hover:text-foreground"
                                  )}
                                >
                                  <SpellcheckHighlighter
                                    text={s.text}
                                    segmentIndex={s.index}
                                    searchTerm={searchTerm}
                                    isCurrentSearchMatch={searchResults[currentResultIndex] === s.index}
                                    showSearch={showSearch}
                                    isActive={activeSegmentIndex === s.index}
                                  />
                                </span>
                                {" "}
                              </span>
                            ))}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      <FloatingToolbar containerRef={contentRef} dict={dict} />

      <SpellcheckReview
        isOpen={isSpellcheckReviewOpen}
        onClose={() => setIsSpellcheckReviewOpen(false)}
        onGoToSegment={handleGoToSegment}
        dict={dict}
      />
    </div>
  );
}

const MemoizedWaveformPlayer = memo(WaveformPlayer);
