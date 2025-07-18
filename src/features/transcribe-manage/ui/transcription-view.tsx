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
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

import { useTranscriptionStore } from "../store/transcription-view-store";
import { formatSrtTime, formatTime } from "@/lib/utils";
import { TranscriptionAudioPlayer } from "./transcription-audio-player";

interface TranscriptionViewProps {
  id: string;
  onBack: () => void;
}

export function TranscriptionView({ id, onBack }: TranscriptionViewProps) {
  const { toast } = useToast();
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const userScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get state and actions from Zustand store
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

  // Find the active segment based on current playback time
  const findActiveSegment = useCallback(
    (currentTime: number) => {
      if (!segments || segments.length === 0) return null;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const nextSegment = i < segments.length - 1 ? segments[i + 1] : null;

        const segmentStart = segment.start / 1000; // Convert to seconds
        const segmentEnd = nextSegment
          ? nextSegment.start / 1000
          : segment.end / 1000;

        if (currentTime >= segmentStart && currentTime < segmentEnd) {
          return i;
        }
      }

      // If we're at the very end, return the last segment
      if (currentTime >= segments[segments.length - 1].start / 1000) {
        return segments.length - 1;
      }

      return null;
    },
    [segments]
  );

  // Handle playback time update
  const handleTimeUpdate = useCallback(
    (currentTime: number) => {
      setCurrentPlaybackTime(currentTime);
      const newActiveSegment = findActiveSegment(currentTime);

      if (
        newActiveSegment !== null &&
        newActiveSegment !== activeSegmentIndex
      ) {
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
      const container = transcriptContainerRef.current;
      const activeSegment = segmentRefs.current[activeSegmentIndex];

      if (activeSegment) {
        activeSegment.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeSegmentIndex, isEditing, isPlaying]);

  // Handle user scroll
  useEffect(() => {
    const handleScroll = () => {
      userScrollRef.current = true;

      // Reset after some time of no scrolling
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        userScrollRef.current = false;
      }, 5000); // Reset after 5 seconds of no scrolling
    };

    const container = transcriptContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Handle segment click to play from that point
  const handleSegmentClick = (index: number) => {
    if (isEditing) return;

    const segment = segments[index];
    if (segment) {
      setActiveSegmentIndex(index);
      // Convert milliseconds to seconds for the audio player
      const startTimeInSeconds = segment.start / 1000;
      setCurrentPlaybackTime(startTimeInSeconds);

      // The actual seeking happens in the TranscriptionAudioPlayer
      // We'll pass this time to the player via a ref
      if (audioPlayerRef.current) {
        audioPlayerRef.current.jumpToTime(startTimeInSeconds);
      }
    }
  };

  // Ref for the audio player component
  const audioPlayerRef = useRef<{
    jumpToTime: (time: number) => void;
  } | null>(null);

  // Effect to handle search when searchTerm changes
  useEffect(() => {
    if (showSearch && searchTerm.trim()) {
      performSearch();
    }
  }, [showSearch, searchTerm, performSearch]);

  // Function to handle copying to clipboard
  const handleCopyToClipboard = () => {
    const transcriptText = getFullTranscript();

    navigator.clipboard
      .writeText(transcriptText)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Transcript has been copied to your clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        toast({
          title: "Copy failed",
          description: "Failed to copy transcript to clipboard",
          variant: "destructive",
        });
      });
  };

  // Function to download as plain text
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

    toast({
      title: "Download started",
      description: "Your transcript is being downloaded as plain text",
    });
  };

  // Function to download as SRT
  const handleDownloadSRT = () => {
    let srtContent = "";
    let counter = 1;

    segments.forEach((segment) => {
      // Format start and end times for SRT (HH:MM:SS,mmm)
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

    toast({
      title: "Download started",
      description: "Your transcript is being downloaded as SRT format",
    });
  };

  // Highlight search term in text
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

  // Handle search navigation
  const handleNavigateSearchResults = (direction: "next" | "prev") => {
    navigateSearchResults(direction);

    // Scroll to the current result
    if (!isEditing && searchResults.length > 0) {
      const element = document.getElementById(
        `segment-${searchResults[currentResultIndex]}`
      );
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Handle search
  const handleSearch = () => {
    const results = performSearch();

    if (!results || results.length === 0) {
      toast({
        title: "No results found",
        description: `No matches found for "${searchTerm}"`,
      });
    } else {
      toast({
        title: "Search results",
        description: `Found ${results.length} matches for "${searchTerm}"`,
      });

      // Scroll to the first result
      if (results.length > 0 && !isEditing) {
        const element = document.getElementById(`segment-${results[0]}`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Handle replace all
  const handleReplaceAll = () => {
    replaceAllOccurrences();

    toast({
      title: "Replace completed",
      description: `Replaced ${searchResults.length} occurrences of "${searchTerm}" with "${replaceTerm}"`,
    });
  };

  if (!metadata) return null;

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
                      metadata.status === "completed"
                        ? "outline"
                        : metadata.status === "in_progress"
                          ? "secondary"
                          : "default"
                    }
                    className="text-xs font-normal capitalize"
                  >
                    {metadata.status.replace("_", " ")}
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
        {metadata.status === "in_progress" && (
          <div className="px-6 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                Processing transcription
              </span>
              <span className="text-sm font-medium">{metadata.progress}%</span>
            </div>
            <Progress value={metadata.progress} className="h-2" />
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
            <TranscriptionAudioPlayer
              audioUrl="/sample1.mp3"
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
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

                {/* Quick copy button */}
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
                {/* Render segments with proper formatting */}
                <div className="space-y-4">
                  {segments.map((segment, index) => (
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
                                  className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 dark:focus:ring-teal-400 min-h-[60px]"
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
                                      searchResults[currentResultIndex] ===
                                        index
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
                              // Implement segment-specific actions if needed
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
          <Button
            variant="outline"
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Transcription
          </Button>

          {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset any unsaved changes if needed
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
