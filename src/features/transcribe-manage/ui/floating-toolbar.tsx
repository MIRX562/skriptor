"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Copy, Search, Replace, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranscriptionStore } from "../store/transcription-view-store";
import { type Dictionary } from "@/i18n/dictionaries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FloatingToolbarProps {
  dict: Dictionary;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function FloatingToolbar({ dict, containerRef }: FloatingToolbarProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const { setShowSearch, setSearchTerm, performSearch } = useTranscriptionStore();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      setPosition(null);
      setSelectedText("");
      return;
    }

    const text = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Check if selection is within the container
    if (containerRef.current && !containerRef.current.contains(range.commonAncestorContainer)) {
        setPosition(null);
        setSelectedText("");
        return;
    }

    setSelectedText(text);
    
    // Position toolbar above selection
    setPosition({
      top: rect.top + window.scrollY - 45,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [handleSelection]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText).then(() => {
      toast.success(dict.view.messages.copySuccess);
      window.getSelection()?.removeAllRanges();
      setPosition(null);
    });
  };

  const handleFind = () => {
    setSearchTerm(selectedText);
    setShowSearch(true);
    performSearch();
    window.getSelection()?.removeAllRanges();
    setPosition(null);
  };

  const handleReplace = () => {
    setSearchTerm(selectedText);
    setShowSearch(true);
    performSearch();
    // Use a small timeout to let the search UI render before focusing
    setTimeout(() => {
        const replaceInput = document.querySelector('input[placeholder="' + dict.view.search.replace + '"]') as HTMLInputElement;
        replaceInput?.focus();
    }, 100);
    window.getSelection()?.removeAllRanges();
    setPosition(null);
  };

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          style={{
            position: "absolute",
            top: position.top,
            left: position.left,
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
          className="flex items-center gap-0.5 bg-slate-900 dark:bg-slate-800 text-white p-1 rounded-full shadow-2xl border border-white/10 ring-4 ring-black/5"
        >
          <ToolbarButton 
            onClick={handleCopy} 
            icon={<Copy className="h-3.5 w-3.5" />} 
            label={dict.view.download.copy} 
          />
          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
          <ToolbarButton 
            onClick={handleFind} 
            icon={<Search className="h-3.5 w-3.5" />} 
            label={dict.view.search.find} 
          />
          <ToolbarButton 
            onClick={handleReplace} 
            icon={<Replace className="h-3.5 w-3.5" />} 
            label={dict.view.search.replace} 
          />
          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
          <button 
            onClick={() => setPosition(null)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToolbarButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/10 rounded-full transition-all text-[11px] font-bold uppercase tracking-tight whitespace-nowrap group"
    >
      <span className="opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
