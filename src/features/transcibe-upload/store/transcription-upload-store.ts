import { create } from "zustand";

export type TranscriptionUploadState = {
  files: File[];
  audioUrl: string | null;
  isRecording: boolean;
  recordingTime: number;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  setFiles: (files: File[]) => void;
  setAudioUrl: (url: string | null) => void;
  setIsRecording: (val: boolean) => void;
  setRecordingTime: (time: number) => void;
  setIsUploading: (val: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setError: (err: string | null) => void;
  reset: () => void;
};

export const useTranscriptionUploadStore = create<TranscriptionUploadState>(
  (set) => ({
    files: [],
    audioUrl: null,
    isRecording: false,
    recordingTime: 0,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    setFiles: (files) => set({ files }),
    setAudioUrl: (audioUrl) => set({ audioUrl }),
    setIsRecording: (isRecording) => set({ isRecording }),
    setRecordingTime: (recordingTime) => set({ recordingTime }),
    setIsUploading: (isUploading) => set({ isUploading }),
    setUploadProgress: (uploadProgress) => set({ uploadProgress }),
    setError: (error) => set({ error }),
    reset: () =>
      set({
        files: [],
        audioUrl: null,
        isRecording: false,
        recordingTime: 0,
        isUploading: false,
        uploadProgress: 0,
        error: null,
      }),
  })
);
