"use client";

import { useEffect, useRef } from "react";
import { Search, X, ChevronDown, ChevronUp, Replace, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranscriptionStore } from "../store/transcription-view-store";
import { type Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SearchControlsProps {
  dict: Dictionary;
  onClose: () => void;
}

export function SearchControls({ dict, onClose }: SearchControlsProps) {
  const {
    searchTerm,
    replaceTerm,
    searchResults,
    currentResultIndex,
    setSearchTerm,
    setReplaceTerm,
    performSearch,
    replaceCurrentOccurrence,
    replaceAllOccurrences,
    navigateSearchResults,
    clearSearch,
  } = useTranscriptionStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleSearch = () => {
    performSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        navigateSearchResults("prev");
      } else {
        navigateSearchResults("next");
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const totalMatches = searchResults.length;
  const currentMatch = totalMatches > 0 ? currentResultIndex + 1 : 0;

  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="p-4 border rounded-xl bg-white dark:bg-slate-900 shadow-sm space-y-3 mb-4 ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Search className="h-3.5 w-3.5" />
            {dict.view.actions.search}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Find Section */}
          <div className="flex-1 space-y-1.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={searchInputRef}
                placeholder={(dict.view.search as any).placeholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  performSearch();
                }}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-32 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-teal-500/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      performSearch();
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {totalMatches > 0 && (
                  <>
                    <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-1">
                      {currentMatch} / {totalMatches}
                    </span>
                    <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-1.5 ml-0.5">
                      <button 
                        onClick={() => navigateSearchResults("prev")}
                        className="p-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => navigateSearchResults("next")}
                        className="p-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Replace Section */}
          <div className="flex-1 space-y-1.5">
            <div className="relative">
              <Replace className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={replaceInputRef}
                placeholder={dict.view.search.replacePlaceholder}
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && replaceCurrentOccurrence()}
                className="pl-9 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-teal-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[11px] font-bold uppercase tracking-tight"
            onClick={replaceCurrentOccurrence}
            disabled={totalMatches === 0}
          >
            <Replace className="h-3.5 w-3.5 mr-1.5" />
            {dict.view.search.replace}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 text-[11px] font-bold uppercase tracking-tight bg-teal-600 hover:bg-teal-700 text-white"
            onClick={replaceAllOccurrences}
            disabled={totalMatches === 0}
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            {dict.view.search.replaceAll}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[11px] font-bold uppercase tracking-tight text-slate-500 hover:text-slate-700"
            onClick={clearSearch}
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            {dict.view.actions.cancel}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
