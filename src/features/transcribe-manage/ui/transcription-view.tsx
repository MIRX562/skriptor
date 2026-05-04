"use client";

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
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
  LayoutList,
  Type,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRouter, useSearchParams } from "next/navigation";

import { useTranscriptionStore } from "../store/transcription-view-store";
import { useTranscription } from "../model/use-transcription";
import { useDeleteTranscription } from "../model/use-delete-transcription";
import { useRetryTranscription } from "../model/use-retry-transcription";
import { useSaveSegments } from "../model/use-save-segments";
import { cn, formatSrtTime, formatTime } from "@/lib/utils";
import { WaveformPlayer, type WaveformPlayerRef } from "./waveform-player";
import { useTranscriptionProgress } from "../model/use-transcription-progress";
import { SegmentRow } from "./segment-row";
import { DownloadOptions } from "./DownloadOptions";
import { type Dictionary } from "@/i18n/dictionaries";

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
  const parentRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<WaveformPlayerRef | null>(null);

  // TanStack Query hooks
  const { data: transcriptionData, isLoading } = useTranscription(id);
  const deleteMutation = useDeleteTranscription();
  const retryMutation = useRetryTranscription();
  const saveSegmentsMutation = useSaveSegments(id);
  const queryClient = useQueryClient();

  const liveProgress = useTranscriptionProgress(id, transcriptionData?.status ?? "processing");

  // Zustand store
  const {
    segments,
    speakers,
    metadata,
    isEditing,
    isCopied,
    showSearch,
    searchTerm,
    replaceTerm,
    searchResults,
    currentResultIndex,
    viewMode,

    initializeFromData,
    setIsEditing,
    setIsCopied,
    setShowSearch,
    setSearchTerm,
    setReplaceTerm,
    setViewMode,

    updateSegment,
    updateSpeakerLabel,
    getSpeakerLabel,
    getFullTranscript,
    performSearch,
    replaceCurrentOccurrence,
    replaceAllOccurrences,
    navigateSearchResults,
  } = useTranscriptionStore();

  const [isSpeakerDialogOpen, setIsSpeakerDialogOpen] = useState(false);

  const handleBack = () => {
    router.push("/dashboard/manage", { scroll: false });
  };

  // Hydrate Zustand store when TanStack Query resolves
  useEffect(() => {
    if (transcriptionData) {
      initializeFromData(transcriptionData);
    }
  }, [transcriptionData, initializeFromData]);

  // Use proxy audio URL to bypass CORS
  useEffect(() => {
    if (!id) return;
    setAudioUrl(`/api/transcription/${id}/audio`);
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

  const handleSearch = () => {
    const results = performSearch();
    if (results.length > 0 && viewMode === "segments") {
      rowVirtualizer.scrollToIndex(results[0], { align: "center" });
    }
  };

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

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>;
  if (!metadata) return null;

  const currentStatus = liveProgress?.status === "pending" || liveProgress?.status === "processing" ? "in_progress" : liveProgress?.status ?? metadata.status;
  const currentProgress = liveProgress?.progress ?? metadata.progress;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 sm:p-6 pb-2 sm:pb-4">
          <div className="space-y-1 min-w-0 flex-1 w-full">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg sm:text-xl truncate">{metadata.title}</CardTitle>
            </div>
            <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs">
              <span className="flex items-center gap-1 shrink-0"><Clock className="h-3 w-3" /> {metadata.duration}</span>
              <span className="shrink-0">{metadata.date}</span>
              <Badge variant="outline" className="capitalize px-1.5 py-0 h-5 text-[9px] sm:text-[10px]">{dict.status[currentStatus] || currentStatus}</Badge>
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <DownloadOptions 
              metadata={metadata} 
              segments={segments} 
              speakers={speakers} 
              dict={dict} 
              onCopy={handleCopyToClipboard}
              trigger={
                <Button variant="outline" size="sm" className="h-8 sm:h-9 shrink-0">
                  <Download className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{dict.view.actions.download}</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              }
            />

            <Button 
              variant={showSearch ? "default" : "outline"} 
              size="sm" 
              className="h-8 sm:h-9 shrink-0"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{dict.view.actions.search}</span>
            </Button>

            {isEditing ? (
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-8 sm:h-9" onClick={() => setIsEditing(false)}>
                  {dict.view.actions.cancel}
                </Button>
                <Button variant="default" size="sm" className="h-8 sm:h-9" onClick={handleSaveChanges} disabled={saveSegmentsMutation.isPending}>
                  <Save className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{dict.view.actions.save}</span>
                  <span className="md:hidden">{dict.view.actions.save}</span>
                </Button>
              </div>
            ) : (
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                {metadata.isSpeakerDiarized && (
                  <Dialog open={isSpeakerDialogOpen} onOpenChange={setIsSpeakerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 sm:h-9">
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

                <Button variant="outline" size="sm" className="h-8 sm:h-9" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{dict.view.actions.edit}</span>
                </Button>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 sm:h-9 shrink-0 text-destructive hover:bg-destructive/10" 
              onClick={handleDelete} 
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{dict.view.actions.delete || "Delete"}</span>
            </Button>
          </div>
        </CardHeader>

        {currentStatus === "in_progress" && (
          <div className="px-6 pb-4">
            <div className="flex justify-between text-xs mb-1"><span>{liveProgress?.message || dict.view.processing.message}</span><span>{currentProgress}%</span></div>
            <Progress value={currentProgress} className="h-1.5" />
          </div>
        )}

        <CardContent className="space-y-4 p-3 sm:p-6">
          <div className="p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
            {audioUrl ? (
              <WaveformPlayer ref={audioPlayerRef} audioUrl={audioUrl} onTimeUpdate={handleTimeUpdate} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} dict={dict} />
            ) : (
              <div className="h-12 flex items-center justify-center text-sm text-muted-foreground">{dict.view.loadingAudio}</div>
            )}
          </div>

          {showSearch && (
            <div className="p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder={dict.view.search.placeholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                </div>
                <Button size="sm" onClick={handleSearch}>{dict.view.search.find}</Button>
              </div>
            </div>
          )}

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <div className="flex items-center justify-between mb-2">
              <TabsList className="h-9 p-1 w-full sm:w-auto">
                <TabsTrigger value="segments" className="flex-1 sm:flex-initial text-xs px-3 h-7">
                  <LayoutList className="h-3 w-3 mr-1.5" /> 
                  {dict.view.tabs.transcript}
                </TabsTrigger>
                <TabsTrigger value="fulltext" className="flex-1 sm:flex-initial text-xs px-3 h-7">
                  <Type className="h-3 w-3 mr-1.5" /> 
                  {dict.view.tabs.readMode || "Read Mode"}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="segments" className="mt-0">
              <div ref={parentRef} className="h-[400px] sm:h-[600px] overflow-auto border rounded-xl relative bg-slate-50/30 dark:bg-slate-900/20">
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
                        onSegmentClick={handleSegmentClick}
                        onTextChange={(idx, val) => updateSegment(idx, "text", val)}
                        onSpeakerChange={(idx, val) => updateSegment(idx, "speakerIndex", val)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fulltext" className="mt-0">
              <div className="h-[400px] sm:h-[600px] overflow-auto border rounded-xl p-4 sm:p-8 bg-white dark:bg-slate-950/50 shadow-inner">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-0">
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
                                  {s.text}
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
