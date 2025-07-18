import { create } from "zustand";
import { devtools } from "zustand/middleware";

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
const validateTranscription = (transcription: any): Transcription => {
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
    status: [
      "queued",
      "processing",
      "completed",
      "failed",
      "in_progress",
    ].includes(transcription.status)
      ? transcription.status
      : "queued",
    mode: ["fast", "medium", "super"].includes(transcription.mode)
      ? transcription.mode
      : "medium",
    progress:
      typeof transcription.progress === "number" ? transcription.progress : 0,
  };
};

export const useTranscriptionListStore = create<TranscriptionListState>()(
  devtools((set, get) => ({
    transcriptions: [],
    searchQuery: null,
    isLoading: false,
    error: null,

    fetchTranscriptions: async () => {
      set({ isLoading: true, error: null });

      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockData = [
          {
            id: "1",
            title: "Team Meeting",
            date: "May 15, 2023",
            duration: "45:22",
            status: "completed",
            mode: "medium",
          },
          {
            id: "2",
            title: "Product Interview",
            date: "May 12, 2023",
            duration: "32:14",
            status: "completed",
            mode: "super",
          },
          {
            id: "3",
            title: "Customer Feedback",
            date: "May 10, 2023",
            duration: "18:45",
            status: "completed",
            mode: "fast",
          },
          {
            id: "4",
            title: "Quarterly Review",
            date: "May 5, 2023",
            duration: "58:30",
            status: "in_progress",
            mode: "medium",
            progress: 75,
          },
        ];

        // Validate all transcriptions before setting state
        const validatedTranscriptions = mockData.map(validateTranscription);

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
