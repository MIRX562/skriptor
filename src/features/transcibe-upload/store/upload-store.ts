import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UploadState {
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  isRecording: boolean;
  recordingTime: number;
  recordedAudio: Blob | null;
  audioUrl: string | null;
  isPlaying: boolean;
  speakerIdentification: boolean;
  speakerCount: number;
  transcriptionSpeed: "fast" | "medium" | "super";
  error: string | null;

  // Actions
  setSelectedFile: (file: File | null) => void;
  startUpload: () => void;
  updateUploadProgress: (progress: number) => void;
  completeUpload: () => void;
  cancelUpload: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  updateRecordingTime: (updater: number | ((prev: number) => number)) => void;
  setRecordedAudio: (blob: Blob | null) => void;
  setAudioUrl: (url: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSpeakerIdentification: (enabled: boolean) => void;
  setSpeakerCount: (count: number) => void;
  setTranscriptionSpeed: (speed: "fast" | "medium" | "super") => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>()(
  devtools((set, get) => ({
    selectedFile: null,
    isUploading: false,
    uploadProgress: 0,
    isRecording: false,
    recordingTime: 0,
    recordedAudio: null,
    audioUrl: null,
    isPlaying: false,
    speakerIdentification: false,
    speakerCount: 2,
    transcriptionSpeed: "medium",
    error: null,

    setSelectedFile: (file) => {
      // Clean up previous audio URL if it exists
      const prevUrl = get().audioUrl;
      if (prevUrl) {
        try {
          URL.revokeObjectURL(prevUrl);
        } catch (e) {
          console.error("Error revoking URL:", e);
        }
      }

      // First set audioUrl to null to ensure clean state
      set({ audioUrl: null, isPlaying: false });

      // Then create new audio URL if file exists (in a separate state update)
      if (file) {
        try {
          const audioUrl = URL.createObjectURL(file);
          console.log("Created URL for file:", audioUrl);
          set({
            selectedFile: file,
            audioUrl,
            recordedAudio: null,
          });
        } catch (e) {
          console.error("Error creating object URL:", e);
          set({
            selectedFile: file,
            recordedAudio: null,
            error: "Failed to create audio preview",
          });
        }
      } else {
        set({
          selectedFile: null,
          recordedAudio: null,
        });
      }
    },

    startUpload: () =>
      set({ isUploading: true, uploadProgress: 0, error: null }),

    updateUploadProgress: (progress) => set({ uploadProgress: progress }),

    completeUpload: () => set({ isUploading: false, uploadProgress: 100 }),

    cancelUpload: () => set({ isUploading: false, uploadProgress: 0 }),

    startRecording: () =>
      set({ isRecording: true, recordingTime: 0, error: null }),

    stopRecording: () => set({ isRecording: false }),

    updateRecordingTime: (updater) =>
      set((state) => ({
        recordingTime:
          typeof updater === "function"
            ? updater(state.recordingTime)
            : updater,
      })),

    setRecordedAudio: (blob) => {
      // Clean up previous audio URL if it exists
      const prevUrl = get().audioUrl;
      if (prevUrl) {
        try {
          URL.revokeObjectURL(prevUrl);
        } catch (e) {
          console.error("Error revoking URL:", e);
        }
      }

      // First set audioUrl to null to ensure clean state
      set({ audioUrl: null, isPlaying: false });

      // Create a File from the Blob if it exists
      if (blob && blob.size > 0) {
        try {
          // Get the MIME type from the blob or use a default
          const mimeType = blob.type || "audio/webm";

          // Create a more descriptive filename with timestamp and extension
          const extension = mimeType.includes("webm")
            ? "webm"
            : mimeType.includes("mp4")
              ? "m4a"
              : mimeType.includes("ogg")
                ? "ogg"
                : "wav";

          const filename = `recording-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`;

          // Create the file object
          const file = new File([blob], filename, { type: mimeType });

          // Create the audio URL
          const newUrl = URL.createObjectURL(blob);

          console.log("Created audio file:", {
            name: filename,
            type: mimeType,
            size: (blob.size / 1024).toFixed(2) + " KB",
            url: newUrl,
          });

          // Validate the URL
          if (!newUrl || newUrl.trim() === "") {
            throw new Error("Failed to create valid audio URL");
          }

          // Update state with all the new data
          set({
            recordedAudio: blob,
            selectedFile: file,
            audioUrl: newUrl,
          });
        } catch (error) {
          console.error("Error creating file from blob:", error);
          set({
            error: "Failed to process the recording. Please try again.",
            recordedAudio: null,
            selectedFile: null,
          });
        }
      } else {
        // No valid blob
        set({
          recordedAudio: null,
          selectedFile: null,
        });
      }
    },

    setAudioUrl: (url) => {
      // Clean up previous URL if it exists
      const prevUrl = get().audioUrl;
      if (prevUrl) {
        try {
          URL.revokeObjectURL(prevUrl);
        } catch (e) {
          console.error("Error revoking URL:", e);
        }
      }

      // Validate URL
      const isValidUrl = !!(url && url.trim() !== "");

      set({
        audioUrl: isValidUrl ? url : null,
        isPlaying: false,
        error: isValidUrl ? null : "Invalid audio URL",
      });
    },

    setIsPlaying: (isPlaying) => set({ isPlaying }),

    setSpeakerIdentification: (enabled) =>
      set({ speakerIdentification: enabled }),

    setSpeakerCount: (count) =>
      set({ speakerCount: Math.max(1, Math.min(10, count)) }),

    setTranscriptionSpeed: (speed) => set({ transcriptionSpeed: speed }),

    setError: (error) => set({ error }),

    reset: () => {
      // Clean up audio URL if it exists
      const prevUrl = get().audioUrl;
      if (prevUrl) {
        try {
          URL.revokeObjectURL(prevUrl);
        } catch (e) {
          console.error("Error revoking URL:", e);
        }
      }

      set({
        selectedFile: null,
        isUploading: false,
        uploadProgress: 0,
        isRecording: false,
        recordingTime: 0,
        recordedAudio: null,
        audioUrl: null,
        isPlaying: false,
        error: null,
      });
    },
  }))
);
