"use client";

import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSpellcheckStore } from "../store/spellcheck-store";
import { useTranscriptionStore } from "../store/transcription-view-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, EyeOff, Plus, AlertCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { formatTimeMMSS } from "@/lib/utils";
import type { TranscriptionSegment } from "../store/transcription-view-store";

interface SpellcheckReviewProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToSegment: (index: number) => void;
  dict: any;
}

export function SpellcheckReview({
  isOpen,
  onClose,
  onGoToSegment,
  dict,
}: SpellcheckReviewProps) {
  const isEnabled = useSpellcheckStore((state) => state.isEnabled);
  const checkTextAction = useSpellcheckStore((state) => state.checkText);
  const ignoreWord = useSpellcheckStore((state) => state.ignoreWord);
  const addCustomWord = useSpellcheckStore((state) => state.addCustomWord);
  
  const segments = useTranscriptionStore((state) => state.segments);
  const updateSegment = useTranscriptionStore((state) => state.updateSegment);

  // Find all spelling errors across all segments
  const allErrors = useMemo(() => {
    if (!isEnabled || !isOpen) return [];

    const errorsList: Array<{
      segmentIndex: number;
      segment: TranscriptionSegment;
      word: string;
      start: number;
      end: number;
      suggestions: string[];
    }> = [];

    segments.forEach((seg, segmentIndex) => {
      const misspelled = checkTextAction(seg.text);
      misspelled.forEach((item) => {
        errorsList.push({
          segmentIndex,
          segment: seg,
          word: item.word,
          start: item.start,
          end: item.end,
          suggestions: item.suggestions,
        });
      });
    });

    return errorsList;
  }, [segments, isEnabled, isOpen, checkTextAction]);

  const handleReplace = (
    segmentIndex: number,
    text: string,
    start: number,
    end: number,
    word: string,
    replacement: string
  ) => {
    const newText = text.substring(0, start) + replacement + text.substring(end);
    updateSegment(segmentIndex, "text", newText);
    toast.success(`Corrected: "${word}" → "${replacement}"`);
  };

  const handleIgnore = (word: string) => {
    ignoreWord(word);
    toast.info(`Ignored "${word}" in this session`);
  };

  const handleAddWord = async (word: string) => {
    await addCustomWord(word);
    toast.success(`Added "${word}" to custom dictionary`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Spelling Review
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {allErrors.length === 0
                ? "No spelling errors detected."
                : `Found ${allErrors.length} spelling error${allErrors.length > 1 ? "s" : ""} in the transcript.`}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 p-6">
          {allErrors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <Check className="h-10 w-10 text-teal-600 bg-teal-100 dark:bg-teal-950/40 p-2 rounded-full" />
              <p className="font-semibold text-foreground">All Clear!</p>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                No misspelled words found. Your transcript is spelling-perfect!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {allErrors.map((error, idx) => {
                const { segmentIndex, segment, word, start, end, suggestions } = error;
                // Generate context preview (highlight the misspelled word in bold/red)
                const beforeText = segment.text.substring(0, start);
                const afterText = segment.text.substring(end);

                return (
                  <div
                    key={`${segment.id}-${word}-${idx}`}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                        {formatTimeMMSS(segment.start)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full"
                        onClick={() => onGoToSegment(segmentIndex)}
                        title="Jump to Segment"
                      >
                        <Play className="h-3 w-3 fill-current" />
                      </Button>
                    </div>

                    <p className="text-sm leading-relaxed text-foreground/80 dark:text-slate-300">
                      {beforeText}
                      <span className="text-red-500 font-bold underline decoration-wavy underline-offset-2">
                        {word}
                      </span>
                      {afterText}
                    </p>

                    <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                        Suggestions
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.length > 0 ? (
                          suggestions.map((sug, sIdx) => (
                            <Button
                              key={sIdx}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-white dark:bg-slate-950 border-slate-200 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 rounded-md"
                              onClick={() =>
                                handleReplace(
                                  segmentIndex,
                                  segment.text,
                                  start,
                                  end,
                                  word,
                                  sug
                                )
                              }
                            >
                              {sug}
                            </Button>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No suggestions
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] px-2 rounded-md text-muted-foreground hover:text-foreground"
                        onClick={() => handleIgnore(word)}
                      >
                        <EyeOff className="h-3 w-3 mr-1" />
                        Ignore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] px-2 rounded-md text-muted-foreground hover:text-foreground"
                        onClick={() => handleAddWord(word)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Word
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
