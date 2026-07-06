import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TranscriptionUploadForm from "../transcription-upload-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const mockDict = {
  transcribe: {
    title: "Transcribe Audio",
    description: "Upload and transcribe",
    form: {
      audioFile: { label: "Audio File", description: "Select an audio file" },
      title: { label: "Title", placeholder: "Enter title" },
      language: { label: "Language", placeholder: "Select language", searchPlaceholder: "Search...", noFound: "No language found", description: "Detect language" },
      speed: { label: "Speed Mode", description: "Choose transcription model speed", fast: { label: "Fast", description: "Standard accuracy" }, turbo: { label: "Turbo", description: "Better accuracy" }, super: { label: "Super", description: "Best accuracy" } },
      diarization: { label: "Speaker Diarization", description: "Identify different speakers" },
      speakers: { label: "Number of Speakers", description: "Expected speakers count" },
      actions: { cancel: "Cancel", start: "Start Transcription", starting: "Starting..." },
    },
    uploadArea: { clickToUpload: "Click to upload", orDragAndDrop: "or drag and drop" },
    messages: { noFile: "Please select a file", uploadFailed: "Upload failed", uploadSuccess: "Success", submitError: "Error" },
    overlay: { title: "Uploading", description: "Please wait" },
  },
};

describe("TranscriptionUploadForm Component", () => {
  it("renders all form elements correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TranscriptionUploadForm dict={mockDict} />
      </QueryClientProvider>
    );

    // Verify title and input presence
    expect(screen.getByText("Audio File")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByText("Speed Mode")).toBeInTheDocument();
    expect(screen.getByText("Speaker Diarization")).toBeInTheDocument();
    expect(screen.getByText("Start Transcription")).toBeInTheDocument();
  });
});
