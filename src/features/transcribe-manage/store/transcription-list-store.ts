import { create } from "zustand";
import { devtools } from "zustand/middleware";

// UI-only state for the transcription list page.
// All server data (fetching, deleting) is handled by TanStack Query hooks
// in `model/use-transcription-list.ts` and `model/use-delete-transcription.ts`.

interface TranscriptionListState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useTranscriptionListStore = create<TranscriptionListState>()(
  devtools(
    (set) => ({
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    { name: "transcription-list-store" }
  )
);
