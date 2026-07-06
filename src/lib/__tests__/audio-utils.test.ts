import { describe, it, expect, vi, beforeEach } from "vitest";
import { blobToAudioUrl, revokeAudioUrl, getAudioDuration, createAudioRecorder } from "../audio-utils";

describe("Audio Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL object
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock Audio constructor
    global.Audio = vi.fn().mockImplementation(function() {
      const audioMock = {
        duration: 42,
        addEventListener: vi.fn().mockImplementation((event, callback) => {
          if (event === "loadedmetadata") {
            setTimeout(callback, 0); // simulate async event
          }
        }),
      };
      return audioMock;
    }) as any;
  });

  it("blobToAudioUrl creates a url", async () => {
    const blob = new Blob(["test"], { type: "audio/webm" });
    const url = await blobToAudioUrl(blob);
    expect(url).toBe("blob:mock-url");
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
  });

  it("revokeAudioUrl calls URL.revokeObjectURL", () => {
    revokeAudioUrl("blob:mock-url");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("getAudioDuration resolves with audio duration", async () => {
    const file = new File(["test"], "test.mp3", { type: "audio/mp3" });
    const duration = await getAudioDuration(file);
    expect(duration).toBe(42);
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("getAudioDuration rejects on error", async () => {
    global.Audio = vi.fn().mockImplementation(function() {
      const audioMock = {
        addEventListener: vi.fn().mockImplementation((event, callback) => {
          if (event === "error") {
            setTimeout(() => callback(new Error("Audio load error")), 0);
          }
        }),
      };
      return audioMock;
    }) as any;

    const file = new File(["test"], "test.mp3", { type: "audio/mp3" });
    await expect(getAudioDuration(file)).rejects.toThrow("Audio load error");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("createAudioRecorder records stream and triggers callbacks", async () => {
    const mockTracks = [{ stop: vi.fn() }];
    const mockStream = {
      getTracks: vi.fn().mockReturnValue(mockTracks),
    };
    
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(mockStream),
    } as any;

    class MockMediaRecorder {
      state = "inactive";
      ondataavailable: ((e: any) => void) | null = null;
      onstop: (() => void) | null = null;
      start() {
        this.state = "recording";
        if (this.ondataavailable) {
          this.ondataavailable({ data: new Blob(["chunk1"], { type: "audio/webm" }) });
          this.ondataavailable({ data: new Blob([], { type: "audio/webm" }) }); // zero size
        }
      }
      stop() {
        this.state = "inactive";
        if (this.onstop) {
          this.onstop();
        }
      }
    }
    global.MediaRecorder = MockMediaRecorder as any;

    const onData = vi.fn();
    const onStop = vi.fn();

    const recorder = createAudioRecorder(onData, onStop);
    await recorder.start();
    
    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(onData).toHaveBeenCalledTimes(1);

    recorder.stop();
    expect(onStop).toHaveBeenCalled();
    expect(mockTracks[0].stop).toHaveBeenCalled();
  });
});
