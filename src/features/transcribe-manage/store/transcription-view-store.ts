"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { formatTime } from "@/lib/utils";
import type { TranscriptionData, Speaker } from "../model/use-transcription";

// UI-local segment shape — speakerIndex links to the speakers list
export interface TranscriptionSegment {
  id: string;
  speakerIndex: number | null;
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
  isSpeakerDiarized: boolean;
}

interface TranscriptionViewState {
  // Data (local editable copy hydrated from TanStack Query)
  segments: TranscriptionSegment[];
  speakers: Speaker[]; // editable local copy of the speakers list
  metadata: TranscriptionMetadata | null;

  // View mode
  viewMode: "segments" | "fulltext";

  // UI state
  isEditing: boolean;
  isCopied: boolean;

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
    field: keyof Pick<TranscriptionSegment, "text" | "speakerIndex">,
    value: string | number | null
  ) => void;

  // Speaker label editing
  updateSpeakerLabel: (speakerIndex: number, label: string) => void;

  setMetadata: (metadata: TranscriptionMetadata) => void;
  setViewMode: (mode: "segments" | "fulltext") => void;

  // UI toggles
  setIsEditing: (isEditing: boolean) => void;
  setIsCopied: (isCopied: boolean) => void;

  // Search controls
  setShowSearch: (showSearch: boolean) => void;
  setSearchTerm: (term: string) => void;
  setReplaceTerm: (term: string) => void;
  setSearchResults: (results: number[]) => void;
  setCurrentResultIndex: (index: number) => void;

  // Derived computations
  getSpeakerLabel: (speakerIndex: number | null) => string | null;
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
      speakers: [],
      metadata: null,

      viewMode: "segments",
      isEditing: false,
      isCopied: false,

      showSearch: false,
      searchTerm: "",
      replaceTerm: "",
      searchResults: [],
      currentResultIndex: -1,

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
          isSpeakerDiarized: data.isSpeakerDiarized ?? false,
        };

        const speakers: Speaker[] = data.speakers ?? [];

        const segments: TranscriptionSegment[] = (data.segments ?? []).map(
          (s) => ({
            id: s.id,
            speakerIndex: s.speakerIndex ?? null,
            text: s.text ?? "",
            start: s.startTime ?? 0,
            end: s.endTime ?? 0,
          })
        );

        set({ metadata, segments, speakers });
      },

      setSegments: (segments) => set({ segments }),

      updateSegment: (index, field, value) => {
        const segments = [...get().segments];
        if (field === "text") {
          segments[index] = { ...segments[index], text: value as string };
        } else if (field === "speakerIndex") {
          segments[index] = { ...segments[index], speakerIndex: value as number | null };
        }
        set({ segments });
      },

      updateSpeakerLabel: (speakerIndex, label) => {
        const speakers = get().speakers.map((s) =>
          s.index === speakerIndex ? { ...s, label } : s
        );
        set({ speakers });
      },

      setMetadata: (metadata) => set({ metadata }),
      setViewMode: (viewMode) => set({ viewMode }),
      setIsEditing: (isEditing) => set({ isEditing }),
      setIsCopied: (isCopied) => set({ isCopied }),

      setShowSearch: (showSearch) => set({ showSearch }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setReplaceTerm: (replaceTerm) => set({ replaceTerm }),
      setSearchResults: (searchResults) => set({ searchResults }),
      setCurrentResultIndex: (currentResultIndex) =>
        set({ currentResultIndex }),

      getSpeakerLabel: (speakerIndex) => {
        if (speakerIndex === null || speakerIndex === undefined) return null;
        const speaker = get().speakers.find((s) => s.index === speakerIndex);
        return speaker?.label ?? `Speaker ${speakerIndex}`;
      },

      getFullTranscript: () => {
        const { segments, getSpeakerLabel } = get();
        return segments
          .map((segment) => {
            const label = getSpeakerLabel(segment.speakerIndex);
            const prefix = label ? `${label} (${formatTime(segment.start)}):\n` : `(${formatTime(segment.start)}):\n`;
            return `${prefix}${segment.text}\n`;
          })
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
