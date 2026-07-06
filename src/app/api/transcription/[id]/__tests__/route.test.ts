import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, DELETE } from "../route";
import { db } from "@/db";
import { deleteAudio } from "@/lib/storage";

vi.mock("@/db", () => {
  const mockDelete = vi.fn().mockImplementation(() => ({
    where: vi.fn().mockResolvedValue({}),
  }));
  return {
    db: {
      delete: mockDelete,
      query: {
        transcriptions: {
          findFirst: vi.fn(),
        },
      },
    },
  };
});

vi.mock("@/lib/storage", () => ({
  deleteAudio: vi.fn().mockResolvedValue(undefined),
}));

describe("Transcription ID API Routes", () => {
  const transId = "test-trans-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET Details", () => {
    it("returns 404 if transcription record is not found", async () => {
      vi.spyOn(db.query.transcriptions, "findFirst").mockResolvedValue(null as any);
      
      const req = new Request("http://localhost");
      const res = await GET(req, { params: Promise.resolve({ id: transId }) });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Transcription not found");
    });

    it("returns details successfully if record found", async () => {
      const mockRecord = { id: transId, title: "Test Title", segments: [] };
      vi.spyOn(db.query.transcriptions, "findFirst").mockResolvedValue(mockRecord as any);

      const req = new Request("http://localhost");
      const res = await GET(req, { params: Promise.resolve({ id: transId }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe("Test Title");
    });
  });

  describe("DELETE Record", () => {
    it("deletes audio and database records successfully", async () => {
      const mockRecord = { id: transId, title: "Test Title", audioUrl: "audio-key.mp3" };
      vi.spyOn(db.query.transcriptions, "findFirst").mockResolvedValue(mockRecord as any);

      const req = new Request("http://localhost", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: transId }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(deleteAudio).toHaveBeenCalledWith("audio-key.mp3");
      expect(db.delete).toHaveBeenCalled();
    });

    it("handles S3 deletion errors gracefully and proceeds to delete DB record", async () => {
      const mockRecord = { id: transId, title: "Test Title", audioUrl: "audio-key.mp3" };
      vi.spyOn(db.query.transcriptions, "findFirst").mockResolvedValue(mockRecord as any);
      vi.mocked(deleteAudio).mockRejectedValueOnce(new Error("S3 Error"));

      const req = new Request("http://localhost", { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: transId }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });
});
