import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { initiateJob } from "@/features/transcibe-upload/server/initiate-job";
import { NextRequest } from "next/server";

vi.mock("@/features/transcibe-upload/server/initiate-job", () => ({
  initiateJob: vi.fn(),
}));

describe("Transcribe Upload API Route (POST)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if request does not contain file or storage key", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost/api/transcribe-upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("No file or storage key provided.");
  });

  it("successfully initiates job for direct file uploads matching schema", async () => {
    const file = new File(["dummy-audio-content"], "test.mp3", { type: "audio/mpeg" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", "Direct Test");
    formData.append("language", "en");
    formData.append("model", "turbo");
    formData.append("isSpeakerDiarized", "true");
    formData.append("numberOfSpeaker", "2");

    const req = new NextRequest("http://localhost/api/transcribe-upload", {
      method: "POST",
      body: formData,
    });

    vi.mocked(initiateJob).mockResolvedValue({ success: true } as any);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(initiateJob).toHaveBeenCalled();
  });

  it("successfully initiates job for storage key uploads", async () => {
    const formData = new FormData();
    formData.append("storageKey", "user-uuid-file-key.mp3");
    formData.append("title", "Storage Test");
    formData.append("language", "id");
    formData.append("model", "large");
    formData.append("isSpeakerDiarized", "false");
    formData.append("numberOfSpeaker", "1");
    formData.append("fileSize", "102400");
    formData.append("fileType", "audio/mpeg");

    const req = new NextRequest("http://localhost/api/transcribe-upload", {
      method: "POST",
      body: formData,
    });

    vi.mocked(initiateJob).mockResolvedValue({ success: true } as any);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(initiateJob).toHaveBeenCalled();
  });

  it("returns 500 when initiateJob fails", async () => {
    const file = new File(["dummy-audio"], "test.mp3", { type: "audio/mpeg" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", "Error Test");
    formData.append("language", "en");
    formData.append("model", "turbo");
    formData.append("isSpeakerDiarized", "true");
    formData.append("numberOfSpeaker", "2");

    const req = new NextRequest("http://localhost/api/transcribe-upload", {
      method: "POST",
      body: formData,
    });

    vi.mocked(initiateJob).mockRejectedValue(new Error("Storage service unavailable"));

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Internal server error.");
  });
});
