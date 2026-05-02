import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { formatTime } from "@/lib/utils";
import type { TranscriptionData } from "../model/use-transcription";

// Defines the shape of a segment as used in the editor UI.
// Sourced from API data via `initializeFromData`, then mutated locally during editing.
export interface TranscriptionSegment {
  id: string;
  speaker: string;
  text: string;
  start: number; // milliseconds
  end: number;   // milliseconds
}

// Derived UI metadata for display purposes.
export interface TranscriptionMetadata {
  id: string;
  title: string;
  date: string;
  duration: string;
  summary: string;
  status: "completed" | "in_progress" | "failed";
  progress: number;
  mode: "fast" | "medium" | "super";
  speakers?: number;
}

interface TranscriptionViewState {
  // Data (local editable copy hydrated from TanStack Query)
  segments: TranscriptionSegment[];
  metadata: TranscriptionMetadata | null;

  // UI state
  isEditing: boolean;
  isCopied: boolean;
  editingSpeakerId: string | null;

  // Search state
  showSearch: boolean;
  searchTerm: string;
  replaceTerm: string;
  searchResults: number[];
  currentResultIndex: number;

  // Hydration — called by TranscriptionView once TanStack Query resolves
  initializeFromData: (data: TranscriptionData) => void;

  // Segment editing
  setSegments: (segments: TranscriptionSegment[]) => void;
  updateSegment: (
    index: number,
    field: keyof TranscriptionSegment,
    value: string | number
  ) => void;

  setMetadata: (metadata: TranscriptionMetadata) => void;

  // UI toggles
  setIsEditing: (isEditing: boolean) => void;
  setIsCopied: (isCopied: boolean) => void;
  setEditingSpeakerId: (id: string | null) => void;

  // Search controls
  setShowSearch: (showSearch: boolean) => void;
  setSearchTerm: (term: string) => void;
  setReplaceTerm: (term: string) => void;
  setSearchResults: (results: number[]) => void;
  setCurrentResultIndex: (index: number) => void;

  // Derived computations
  getFullTranscript: () => string;
  performSearch: () => number[];
  replaceCurrentOccurrence: () => void;
  replaceAllOccurrences: () => void;
  navigateSearchResults: (direction: "next" | "prev") => void;
}

export const useTranscriptionStore = create<TranscriptionViewState>()(
  devtools(
    (set, get) => ({
      segments: [],
      metadata: null,

      isEditing: false,
      isCopied: false,
      editingSpeakerId: null,

      showSearch: false,
      searchTerm: "",
      replaceTerm: "",
      searchResults: [],
      currentResultIndex: -1,

      // Hydrate local state from the API response (called by the component)
      initializeFromData: (data: TranscriptionData) => {
        const md = (data.metadata as { originalFilename?: string; durationSeconds?: number }) ?? {};

        const metadata: TranscriptionMetadata = {
          id: data.id,
          title: md.originalFilename ?? data.title ?? "Untitled",
          date: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString(),
          duration: md.durationSeconds
            ? `${Math.floor(md.durationSeconds / 60)}:${Math.floor(md.durationSeconds % 60).toString().padStart(2, "0")}`
            : "00:00",
          summary: data.summary ?? "",
          status:
            data.status === "processing" || data.status === "queued"
              ? "in_progress"
              : (data.status as "completed" | "failed"),
          progress: 100,
          mode:
            data.model === "small"
              ? "fast"
              : data.model === "large"
                ? "super"
                : "medium",
          speakers: data.numberOfSpeaker ?? 1,
        };

        const segments: TranscriptionSegment[] = (data.segments ?? []).map(
          (s) => ({
            id: s.id,
            speaker: s.speaker ?? "Unknown",
            text: s.text ?? "",
            start: s.startTime ?? 0,
            end: s.endTime ?? 0,
          })
        );

        set({ metadata, segments });
      },

      setSegments: (segments) => set({ segments }),

      updateSegment: (index, field, value) => {
        const segments = [...get().segments];
        if (field === "text" || field === "speaker" || field === "id") {
          segments[index][field] = value as string;
        } else {
          segments[index][field] = value as number;
        }
        set({ segments });
      },

      setMetadata: (metadata) => set({ metadata }),

      setIsEditing: (isEditing) => set({ isEditing }),
      setIsCopied: (isCopied) => set({ isCopied }),
      setEditingSpeakerId: (id) => set({ editingSpeakerId: id }),

      setShowSearch: (showSearch) => set({ showSearch }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setReplaceTerm: (replaceTerm) => set({ replaceTerm }),
      setSearchResults: (searchResults) => set({ searchResults }),
      setCurrentResultIndex: (currentResultIndex) =>
        set({ currentResultIndex }),

      getFullTranscript: () => {
        const { segments } = get();
        return segments
          .map(
            (segment) =>
              `${segment.speaker} (${formatTime(segment.start)}):\n${segment.text}\n`
          )
          .join("\n");
      },

      performSearch: () => {
        const { searchTerm, segments } = get();

        if (!searchTerm.trim()) {
          set({ searchResults: [], currentResultIndex: -1 });
          return [];
        }

        const results: number[] = [];
        segments.forEach((segment, index) => {
          if (segment.text.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push(index);
          }
        });

        set({
          searchResults: results,
          currentResultIndex: results.length > 0 ? 0 : -1,
        });

        return results;
      },

      replaceCurrentOccurrence: () => {
        const {
          currentResultIndex,
          searchResults,
          segments,
          searchTerm,
          replaceTerm,
        } = get();

        if (currentResultIndex === -1 || searchResults.length === 0) return;

        const segmentIndex = searchResults[currentResultIndex];
        const segment = segments[segmentIndex];
        const newText = segment.text.replace(
          new RegExp(searchTerm, "gi"),
          replaceTerm
        );

        get().updateSegment(segmentIndex, "text", newText);
        get().performSearch();
      },

      replaceAllOccurrences: () => {
        const { searchResults, segments, searchTerm, replaceTerm } = get();

        if (searchResults.length === 0) return;

        const newSegments = segments.map((segment) => ({
          ...segment,
          text: segment.text.replace(new RegExp(searchTerm, "gi"), replaceTerm),
        }));

        set({
          segments: newSegments,
          searchResults: [],
          currentResultIndex: -1,
        });
      },

      navigateSearchResults: (direction) => {
        const { searchResults, currentResultIndex } = get();

        if (searchResults.length === 0) return;

        let newIndex: number;
        if (direction === "next") {
          newIndex = (currentResultIndex + 1) % searchResults.length;
        } else {
          newIndex =
            (currentResultIndex - 1 + searchResults.length) %
            searchResults.length;
        }

        set({ currentResultIndex: newIndex });
      },
    }),
    { name: "transcription-view-store" }
  )
);
