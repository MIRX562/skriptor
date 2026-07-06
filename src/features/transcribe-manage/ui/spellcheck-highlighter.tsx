"use client";

import { useMemo } from "react";
import { useSpellcheckStore } from "../store/spellcheck-store";
import { useTranscriptionStore } from "../store/transcription-view-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SpellcheckHighlighterProps {
  text: string;
  segmentIndex: number;
  searchTerm?: string;
  isCurrentSearchMatch?: boolean;
  showSearch?: boolean;
  isActive?: boolean;
}

export function SpellcheckHighlighter({
  text,
  segmentIndex,
  searchTerm,
  isCurrentSearchMatch = false,
  showSearch = false,
  isActive = false,
}: SpellcheckHighlighterProps) {
  const isEnabled = useSpellcheckStore((state) => state.isEnabled);
  const checkTextAction = useSpellcheckStore((state) => state.checkText);
  const ignoreWord = useSpellcheckStore((state) => state.ignoreWord);
  const addCustomWord = useSpellcheckStore((state) => state.addCustomWord);
  const updateSegment = useTranscriptionStore((state) => state.updateSegment);

  // Scan text for spelling errors if spellcheck is enabled
  const misspelledWords = useMemo(() => {
    if (!isEnabled) return [];
    return checkTextAction(text);
  }, [text, isEnabled, checkTextAction]);

  // If search is active, we can split text for search highlights
  const highlightSearch = (chunk: string) => {
    if (!showSearch || !searchTerm) return chunk;
    const parts = chunk.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark
              key={i}
              className={cn(
                "rounded px-0.5 font-medium transition-colors",
                isCurrentSearchMatch 
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
  };

  // If no spelling errors, render search-highlighted text directly
  if (misspelledWords.length === 0) {
    return <>{highlightSearch(text)}</>;
  }

  // Segment text and render popovers for spelling errors
  const elements: React.ReactNode[] = [];
  let currentIndex = 0;

  misspelledWords.forEach((item, wordIdx) => {
    const { word, start, end, suggestions } = item;
    
    // Add text preceding the misspelled word
    if (start > currentIndex) {
      const normalText = text.substring(currentIndex, start);
      elements.push(<span key={`text-${wordIdx}`}>{highlightSearch(normalText)}</span>);
    }

    const handleReplace = (replacement: string) => {
      const newText = text.substring(0, start) + replacement + text.substring(end);
      updateSegment(segmentIndex, "text", newText);
      toast.success(`Corrected: "${word}" → "${replacement}"`);
    };

    const handleIgnore = () => {
      ignoreWord(word);
      toast.info(`Ignored "${word}" in this session`);
    };

    const handleAddToDictionary = async () => {
      await addCustomWord(word);
      toast.success(`Added "${word}" to custom dictionary`);
    };

    // Add misspelled word wrapped in Popover
    elements.push(
      <Popover key={`misspelled-${word}-${wordIdx}`}>
        <PopoverTrigger asChild>
          <span
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "underline decoration-red-500/80 decoration-wavy underline-offset-4 cursor-pointer hover:bg-red-500/10 transition-colors duration-150 rounded px-0.5 inline-block font-medium",
              isActive && "bg-red-500/5"
            )}
          >
            {word}
          </span>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Spelling suggestion</span>
              <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-mono">
                error
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              {suggestions.length > 0 ? (
                suggestions.map((sug, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    className="justify-start h-8 text-sm hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:text-teal-600 dark:hover:text-teal-400 text-left font-medium rounded-lg"
                    onClick={() => handleReplace(sug)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 opacity-65 text-teal-600 dark:text-teal-400" />
                    {sug}
                  </Button>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic px-2 py-1">
                  No suggestions found
                </span>
              )}
            </div>

            <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />

            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] px-2 flex-1 justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={handleIgnore}
              >
                <EyeOff className="h-3 w-3 mr-1" />
                Ignore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] px-2 flex-1 justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={handleAddToDictionary}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Word
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );

    currentIndex = end;
  });

  // Add remaining trailing text
  if (currentIndex < text.length) {
    const trailingText = text.substring(currentIndex);
    elements.push(<span key="text-trailing">{highlightSearch(trailingText)}</span>);
  }

  return <>{elements}</>;
}
