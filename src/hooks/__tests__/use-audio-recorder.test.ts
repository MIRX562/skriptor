import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioRecorder } from "../use-audio-recorder";
import { useTranscriptionUploadStore } from "@/features/transcibe-upload/store/transcription-upload-store";

describe("useAudioRecorder Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTranscriptionUploadStore.setState({
      isRecording: false,
      recordingTime: 0,
      audioUrl: "",
      error: null,
    });
  });

  it("should initialize default state variables from upload store", () => {
    const { result } = renderHook(() => useAudioRecorder());
    expect(result.current.isRecording).toBe(false);
    expect(result.current.recordingTime).toBe(0);
  });

  it("should handle error when mediaDevices.getUserMedia fails", async () => {
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")),
    } as any;

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    const store = useTranscriptionUploadStore.getState();
    expect(store.isRecording).toBe(false);
    expect(store.error).toContain("Could not access microphone");
  });

  it("should successfully record audio and create URL on stop", async () => {
    vi.useFakeTimers();

    const mockTracks = [{ stop: vi.fn() }];
    const mockStream = {
      getTracks: vi.fn().mockReturnValue(mockTracks),
    };
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(mockStream),
    } as any;

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-recorded-url");

    let recorderInstance: any = null;
    class MockMediaRecorder {
      constructor() {
        recorderInstance = this;
      }
      state = "inactive";
      ondataavailable = vi.fn();
      onstop = vi.fn();
      start = vi.fn().mockImplementation(() => {
        this.state = "recording";
      });
      stop = vi.fn().mockImplementation(() => {
        this.state = "inactive";
        if (this.onstop) this.onstop();
      });
    }
    global.MediaRecorder = MockMediaRecorder as any;

    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(useTranscriptionUploadStore.getState().isRecording).toBe(true);

    // Simulate timer ticks
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Verify timer ticks
    expect(useTranscriptionUploadStore.getState().recordingTime).toBe(2);

    // Simulate media recorder capturing chunk data
    act(() => {
      recorderInstance.ondataavailable({
        data: new Blob(["audio-data-chunk"], { type: "audio/webm" }),
      });
    });

    // Stop recording
    await act(async () => {
      result.current.stopRecording();
    });

    expect(useTranscriptionUploadStore.getState().isRecording).toBe(false);
    expect(useTranscriptionUploadStore.getState().audioUrl).toBe("blob:mock-recorded-url");
    expect(mockTracks[0].stop).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
