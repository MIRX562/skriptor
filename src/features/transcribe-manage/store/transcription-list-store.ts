import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getTranscripstionList } from "../model/query";

export interface Transcription {
  id?: string;
  title: string;
  date: string;
  duration: string;
  status: "queued" | "processing" | "completed" | "failed" | "in_progress";
  mode?: "fast" | "medium" | "super";
  progress?: number;
}

interface TranscriptionListState {
  transcriptions: Transcription[];
  searchQuery: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTranscriptions: () => Promise<void>;
  createTranscription: (
    transcription: Omit<Transcription, "id">
  ) => Promise<void>;
  updateTranscription: (
    id: string,
    data: Partial<Transcription>
  ) => Promise<void>;
  deleteTranscription: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setError: (error: string | null) => void;
}

// Helper function to validate transcription data
const validateTranscription = (transcription: Partial<Transcription> & { model?: string; createdAt?: Date | string; metadata?: Record<string, unknown> }): Transcription => {
  return {
    id: transcription.id || `tr_${Math.random().toString(36).substring(2, 9)}`,
    title:
      typeof transcription.title === "string"
        ? transcription.title
        : "Untitled",
    date:
      typeof transcription.date === "string"
        ? transcription.date
        : new Date().toLocaleDateString(),
    duration:
      typeof transcription.duration === "string"
        ? transcription.duration
        : "00:00",
    status: (transcription.status && [
      "queued",
      "processing",
      "completed",
      "failed",
      "in_progress",
    ].includes(transcription.status))
      ? (transcription.status as Transcription["status"])
      : "queued",
    mode: (transcription.mode && ["fast", "medium", "super"].includes(transcription.mode))
      ? (transcription.mode as Transcription["mode"])
      : "medium",
    progress:
      typeof transcription.progress === "number" ? transcription.progress : 0,
  };
};

export const useTranscriptionListStore = create<TranscriptionListState>()(
  devtools((set) => ({
    transcriptions: [],
    searchQuery: null,
    isLoading: false,
    error: null,

    fetchTranscriptions: async () => {
      set({ isLoading: true, error: null });

      try {
        const data = await getTranscripstionList();
        
        if (!data) {
          set({ transcriptions: [], isLoading: false });
          return;
        }

        const mappedData = data.map((t: { id: string; metadata: unknown; createdAt: Date | string; status: string; model: string }) => ({
          id: t.id,
          title: (t.metadata as { originalFilename?: string })?.originalFilename || "Untitled",
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          duration: (t.metadata as { durationSeconds?: number })?.durationSeconds ? `${Math.floor((t.metadata as { durationSeconds: number }).durationSeconds / 60)}:${Math.floor((t.metadata as { durationSeconds: number }).durationSeconds % 60).toString().padStart(2, "0")}` : "00:00",
          status: ((t.status === "processing" || t.status === "queued") ? "in_progress" : t.status) as Transcription["status"],
          mode: (t.model === "small" ? "fast" : t.model === "large" ? "super" : "medium") as Transcription["mode"],
          progress: 0,
        }));

        const validatedTranscriptions = mappedData.map(validateTranscription);

        set({
          transcriptions: validatedTranscriptions,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching transcriptions:", error);
        set({
          error: "Failed to load transcriptions. Please try again.",
          isLoading: false,
        });
      }
    },

    createTranscription: async (transcription) => {
      set({ isLoading: true, error: null });

      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const validatedTranscription = validateTranscription({
          ...transcription,
          id: Math.random().toString(36).substring(2, 9),
        });

        set((state) => ({
          transcriptions: [validatedTranscription, ...state.transcriptions],
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error creating transcription:", error);
        set({
          error: "Failed to create transcription. Please try again.",
          isLoading: false,
        });
      }
    },

    updateTranscription: async (id, data) => {
      set({ isLoading: true, error: null });

      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and update local state
        await new Promise((resolve) => setTimeout(resolve, 500));

        set((state) => ({
          transcriptions: state.transcriptions.map((t) =>
            t.id === id ? validateTranscription({ ...t, ...data }) : t
          ),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error updating transcription:", error);
        set({
          error: "Failed to update transcription. Please try again.",
          isLoading: false,
        });
      }
    },

    deleteTranscription: async (id) => {
      set({ isLoading: true, error: null });

      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and update local state
        await new Promise((resolve) => setTimeout(resolve, 500));

        set((state) => ({
          transcriptions: state.transcriptions.filter((t) => t.id !== id),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error deleting transcription:", error);
        set({
          error: "Failed to delete transcription. Please try again.",
          isLoading: false,
        });
      }
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    setError: (error) => set({ error }),
  }))
);
