import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayer } from "../use-audio-player";
import { useTranscriptionUploadStore } from "@/features/transcibe-upload/store/transcription-upload-store";

describe("useAudioPlayer Hook", () => {
  let callbacks: Record<string, Function[]> = {};
  let audioInstanceMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    callbacks = {};

    audioInstanceMock = {
      duration: 120,
      currentTime: 0,
      src: "",
      load: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn().mockImplementation((event, callback) => {
        if (!callbacks[event]) callbacks[event] = [];
        callbacks[event].push(callback);
      }),
      removeEventListener: vi.fn(),
    };

    global.Audio = vi.fn().mockImplementation(function() {
      return audioInstanceMock;
    }) as any;
    useTranscriptionUploadStore.setState({ audioUrl: "" });
  });

  const triggerEvent = (event: string) => {
    if (callbacks[event]) {
      callbacks[event].forEach((cb) => cb());
    }
  };

  it("should initialize with default idle states", () => {
    const { result } = renderHook(() => useAudioPlayer());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isReady).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.currentTime).toBe(0);
  });

  it("updates audio source and loads when audioUrl changes in store", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAudioPlayer());

    // Update upload store url
    act(() => {
      useTranscriptionUploadStore.setState({ audioUrl: "https://example.com/audio.mp3" });
    });

    // Let the useEffect load delay run
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(audioInstanceMock.src).toBe("https://example.com/audio.mp3");
    expect(audioInstanceMock.load).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(true);

    // Simulate canplaythrough event
    act(() => {
      triggerEvent("canplaythrough");
    });

    expect(result.current.isReady).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.duration).toBe(120);
    vi.useRealTimers();
  });

  it("handles playback play and pause toggles", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAudioPlayer());

    // Load audio
    act(() => {
      useTranscriptionUploadStore.setState({ audioUrl: "https://example.com/audio.mp3" });
    });
    act(() => {
      vi.advanceTimersByTime(100);
      triggerEvent("canplaythrough");
    });

    expect(result.current.isReady).toBe(true);

    // Play
    act(() => {
      result.current.togglePlayPause();
    });
    expect(result.current.isPlaying).toBe(true);

    // Pause
    act(() => {
      result.current.togglePlayPause();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(audioInstanceMock.pause).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("updates progress time on timeupdate, and stops on ended", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      useTranscriptionUploadStore.setState({ audioUrl: "https://example.com/audio.mp3" });
    });
    act(() => {
      vi.advanceTimersByTime(100);
      triggerEvent("canplaythrough");
    });

    // Play
    act(() => {
      result.current.togglePlayPause();
    });

    // Simulate time update
    audioInstanceMock.currentTime = 30;
    act(() => {
      triggerEvent("timeupdate");
    });
    expect(result.current.currentTime).toBe(30);

    // Simulate ended
    act(() => {
      triggerEvent("ended");
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
    vi.useRealTimers();
  });

  it("handles seekTo correctly", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      useTranscriptionUploadStore.setState({ audioUrl: "https://example.com/audio.mp3" });
    });
    act(() => {
      vi.advanceTimersByTime(100);
      triggerEvent("canplaythrough");
    });

    act(() => {
      result.current.seekTo(45);
    });

    expect(audioInstanceMock.currentTime).toBe(45);
    expect(result.current.currentTime).toBe(45);
    vi.useRealTimers();
  });

  it("formats times accurately", () => {
    const { result } = renderHook(() => useAudioPlayer());
    expect(result.current.formatTime(125)).toBe("02:05");
    expect(result.current.formatTime(9)).toBe("00:09");
    expect(result.current.formatTime(NaN)).toBe("00:00");
  });
});
