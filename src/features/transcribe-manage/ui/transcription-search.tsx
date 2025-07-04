import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Replace, X } from "lucide-react";
import { useTranscriptionStore } from "../store/transcription-view-store";

export function TranscriptionSearch() {
  const {
    showSearch,
    searchTerm,
    replaceTerm,
    setSearchTerm,
    setReplaceTerm,
    setShowSearch,
    performSearch,
    replaceCurrentOccurrence,
    replaceAllOccurrences,
  } = useTranscriptionStore();

  return (
    showSearch && (
      <div className="mb-4 p-3 border rounded-md bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
            <Button size="sm" variant="secondary" onClick={performSearch}>
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
            <Input
              placeholder="Replace with..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              className="h-8"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={replaceCurrentOccurrence}
            >
              Replace
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={replaceAllOccurrences}
            >
              Replace All
            </Button>
          </div>
        </div>
      </div>
    )
  );
}
