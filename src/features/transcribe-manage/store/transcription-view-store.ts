import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Define the interface for a transcription segment
export interface TranscriptionSegment {
  speaker: string;
  text: string;
  start: number; // in milliseconds
  end: number; // in milliseconds
}

// Define the interface for transcription metadata
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

interface TranscriptionState {
  // Transcription data
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

  // Actions
  setSegments: (segments: TranscriptionSegment[]) => void;
  updateSegment: (
    index: number,
    field: keyof TranscriptionSegment,
    value: string | number
  ) => void;

  setMetadata: (metadata: TranscriptionMetadata) => void;

  setIsEditing: (isEditing: boolean) => void;
  setIsCopied: (isCopied: boolean) => void;
  setEditingSpeakerId: (id: string | null) => void;

  setShowSearch: (showSearch: boolean) => void;
  setSearchTerm: (term: string) => void;
  setReplaceTerm: (term: string) => void;
  setSearchResults: (results: number[]) => void;
  setCurrentResultIndex: (index: number) => void;

  getFullTranscript: () => string;
  performSearch: () => void;
  replaceCurrentOccurrence: () => void;
  replaceAllOccurrences: () => void;
  navigateSearchResults: (direction: "next" | "prev") => void;
}

// Sample data
const initialSegments: TranscriptionSegment[] = [
  {
    speaker: "Speaker 1",
    text: "Good morning everyone. Thanks for joining today's team meeting. We have a lot to cover, so let's get started.",
    start: 0,
    end: 12000,
  },
  {
    speaker: "Speaker 2",
    text: "Before we begin, can I quickly ask about the status of the Johnson project?",
    start: 12000,
    end: 18000,
  },
  {
    speaker: "Speaker 1",
    text: "Sure. We're currently on track with the Johnson project. The development team completed the first phase last week, and we're moving into testing now.",
    start: 18000,
    end: 32000,
  },
  {
    speaker: "Speaker 3",
    text: "I have some concerns about the timeline for the testing phase. I think we might need an additional week.",
    start: 32000,
    end: 40000,
  },
  {
    speaker: "Speaker 1",
    text: "Let's discuss that in detail when we get to the project updates section. For now, let's go through the agenda.",
    start: 40000,
    end: 48000,
  },
  {
    speaker: "Speaker 2",
    text: "Sounds good to me.",
    start: 48000,
    end: 50000,
  },
  {
    speaker: "Speaker 1",
    text: "First item is the quarterly results. I'm happy to report that we've exceeded our targets by 12%.",
    start: 50000,
    end: 60000,
  },
];

const sampleMetadata: TranscriptionMetadata = {
  id: "sample-id",
  title: "Team Meeting - May 10",
  date: "May 10, 2023",
  duration: "45:12",
  status: "in_progress",
  progress: 68,
  mode: "medium",
  speakers: 3,
  summary: `
Meeting Summary
The team meeting covered several key topics including project updates, quarterly results, and upcoming deadlines.
Key Points:
The Johnson project is on track with the first phase completed
There are concerns about the testing phase timeline
Quarterly results exceeded targets by 12%
New marketing strategy to be implemented next month
Team restructuring planned for Q3
Action Items:
Review testing phase timeline (Owner: Speaker 3)
Prepare detailed quarterly report (Owner: Speaker 1)
Schedule follow-up meeting for marketing strategy (Owner: Speaker 2)
  `,
};

// Format milliseconds to MM:SS.mmm
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
};

export const useTranscriptionStore = create<TranscriptionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      segments: initialSegments,
      metadata: sampleMetadata,

      isEditing: false,
      isCopied: false,
      editingSpeakerId: null,

      showSearch: false,
      searchTerm: "",
      replaceTerm: "",
      searchResults: [],
      currentResultIndex: -1,

      // Actions for updating state
      setSegments: (segments) => set({ segments }),
      updateSegment: (index, field, value) => {
        const segments = [...get().segments];
        if (field === "text" || field === "speaker") {
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
          return;
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

        let newIndex = currentResultIndex;
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
    { name: "transcription-store" }
  )
);
