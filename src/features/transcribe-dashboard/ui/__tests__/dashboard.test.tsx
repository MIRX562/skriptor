import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TranscriptionDashboard } from "../transcription-dashboard";
import { useTranscriptionList } from "@/features/transcribe-manage/model/use-transcription-list";

// Mock the model hooks
vi.mock("@/features/transcribe-manage/model/use-transcription-list", () => ({
  useTranscriptionList: vi.fn(),
}));

const mockDict = {
  status: {
    queued: "Queued",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
  },
  dashboard: {
    title: "Dashboard Overview",
    errors: { loadFailed: "Failed to load" },
    stats: {
      totalTranscriptions: "Total Transcriptions",
      allTime: "All Time",
      hoursProcessed: "Hours Processed",
      totalAudio: "Total Audio",
      usage: "Usage",
      ofPlan: "of {planHours} hours",
    },
    actions: {
      newTranscription: "New Transcription",
      startNow: "Start Now",
      uploadOrRecord: "Upload or Record",
    },
    recentTranscriptions: {
      title: "Recent Transcriptions",
      description: "Your latest work",
      noTranscriptions: "No transcriptions found",
    },
    monthlyStats: {
      title: "Monthly Stats",
      description: "Overview",
    },
  },
};

describe("TranscriptionDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeletons during loading state", () => {
    vi.mocked(useTranscriptionList).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<TranscriptionDashboard dict={mockDict} />);
    expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
  });

  it("renders error message on query failure", () => {
    vi.mocked(useTranscriptionList).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Server disconnected"),
    } as any);

    render(<TranscriptionDashboard dict={mockDict} />);
    expect(screen.getByText("Server disconnected")).toBeInTheDocument();
  });

  it("renders stats and recent transcriptions list when loaded", () => {
    const mockTranscriptions = [
      {
        id: "t1",
        title: "Test audio",
        status: "completed",
        metadata: { durationSeconds: 360 }, // 6 minutes
        createdAt: new Date().toISOString(),
      },
    ];

    vi.mocked(useTranscriptionList).mockReturnValue({
      data: mockTranscriptions,
      isLoading: false,
      error: null,
    } as any);

    render(<TranscriptionDashboard dict={mockDict} />);

    // Verification of count and formatting
    expect(screen.getByText("1")).toBeInTheDocument(); // total transcriptions
    expect(screen.getByText("0:06:00")).toBeInTheDocument(); // duration formatting
  });
});
