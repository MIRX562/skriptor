import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { db } from "@/db";
import { getPresignedUrl } from "@/lib/storage";

vi.mock("@/db", () => ({
  db: {
    query: {
      transcriptions: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/lib/storage", () => ({
  getPresignedUrl: vi.fn().mockResolvedValue("https://s3.example.com/presigned-audio.mp3"),
}));

describe("Transcription Audio API Route (GET)", () => {
  const transId = "test-trans-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 if transcription record or audioUrl is missing", async () => {
    vi.spyOn(db.query.transcriptions, "findFirst").mockResolvedValue(null as any);

    const req = new Request("http://localhost");
    const res = await GET(req, { params: Promise.resolve({ id: transId }) });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Transcription audio not found");
  });

  it("returns presigned audio URL successfully", async () => {
    const mockRecord = { id: transId, title: "Meeting Audio", audioUrl: "audio-file.mp3" };
    vi.spyOn(db.query.transcriptions, "findFirst").mockResolvedValue(mockRecord as any);

    const req = new Request("http://localhost");
    const res = await GET(req, { params: Promise.resolve({ id: transId }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.url).toBe("https://s3.example.com/presigned-audio.mp3");
    expect(getPresignedUrl).toHaveBeenCalledWith("audio-file.mp3", 3600, undefined);
  });

  it("performs redirection for download request", async () => {
    const mockRecord = { id: transId, title: "Meeting Audio", audioUrl: "audio-file.mp3" };
    vi.spyOn(db.query.transcriptions, "findFirst").mockResolvedValue(mockRecord as any);

    const req = new Request("http://localhost?download=true");
    const res = await GET(req, { params: Promise.resolve({ id: transId }) });

    expect(res.status).toBe(302); // Redirect
    expect(res.headers.get("location")).toBe("https://s3.example.com/presigned-audio.mp3");
    expect(getPresignedUrl).toHaveBeenCalledWith("audio-file.mp3", 3600, "Meeting Audio.mp3");
  });
});
