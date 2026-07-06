import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { db } from "@/db";
import { redis } from "@/lib/redis";
import crypto from "crypto";
import { NextRequest } from "next/server";

// Mock the db operations
vi.mock("@/db", () => {
  const mockInsert = vi.fn().mockImplementation(() => ({
    values: vi.fn().mockImplementation(() => ({
      returning: vi.fn().mockResolvedValue([{ id: "seg-uuid-1" }]),
    })),
  }));

  const mockUpdate = vi.fn().mockImplementation(() => ({
    set: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockResolvedValue([{ id: "trans-uuid-1" }]),
    })),
  }));

  return {
    db: {
      insert: mockInsert,
      update: mockUpdate,
    },
  };
});

const SHARED_SECRET = "test-secret";

function createSignedRequest(body: string, timestamp: number, signatureOverride?: string) {
  const hmac = crypto.createHmac("sha256", SHARED_SECRET);
  hmac.update(timestamp.toString() + "." + body);
  const signature = signatureOverride || `sha256=${hmac.digest("hex")}`;

  const headers = new Headers();
  headers.set("x-worker-timestamp", timestamp.toString());
  headers.set("x-worker-signature", signature);
  headers.set("content-type", "application/json");

  return new NextRequest("http://localhost/api/transcribe-upload/worker-callback", {
    method: "POST",
    headers,
    body,
  });
}

describe("Worker Callback API Route (POST)", () => {
  const transcriptionId = "400ad067-17eb-4f4d-b0df-892419c8f307";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(redis, "del").mockResolvedValue(1);
  });

  it("returns 401 if x-worker-timestamp or x-worker-signature is missing", async () => {
    const body = JSON.stringify({ transcriptionId, status: "completed" });
    const req = new NextRequest("http://localhost/api/transcribe-upload/worker-callback", {
      method: "POST",
      body,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid signature");
  });

  it("returns 401 if timestamp drift is greater than 120 seconds", async () => {
    const body = JSON.stringify({ transcriptionId, status: "completed" });
    const oldTimestamp = Math.floor(Date.now() / 1000) - 150;
    const req = createSignedRequest(body, oldTimestamp);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid signature");
  });

  it("returns 401 if the HMAC signature is invalid", async () => {
    const body = JSON.stringify({ transcriptionId, status: "completed" });
    const now = Math.floor(Date.now() / 1000);
    const sameLengthInvalidSig = "sha256=" + "a".repeat(64);
    const req = createSignedRequest(body, now, sameLengthInvalidSig);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Invalid signature");
  });

  it("returns 400 if validation schema fails", async () => {
    // missing required fields or incorrect types
    const body = JSON.stringify({ transcriptionId: "not-a-uuid", status: "completed" });
    const now = Math.floor(Date.now() / 1000);
    const req = createSignedRequest(body, now);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("updates transcription status to failed when status is failed", async () => {
    const payload = {
      transcriptionId,
      status: "failed",
      metadata: {
        originalFilename: "audio.mp3",
      },
    };
    const body = JSON.stringify(payload);
    const now = Math.floor(Date.now() / 1000);
    const req = createSignedRequest(body, now);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.update).toHaveBeenCalled();
    expect(redis.del).toHaveBeenCalledWith(`transcription:progress:${transcriptionId}:last`);
  });

  it("saves segments and updates transcription row on completed status", async () => {
    const payload = {
      transcriptionId,
      status: "completed",
      summary: "Sample audio summary.",
      metadata: {
        durationSeconds: 120,
        model: "turbo" as const,
        originalFilename: "meeting.mp3",
        mimeType: "audio/mp3",
        sizeBytes: 1048576,
        language: "en",
      },
      segments: [
        {
          speaker: "SPEAKER_00",
          text: "Hello everyone",
          startTimeMs: 100,
          endTimeMs: 1500,
        },
        {
          speaker: "SPEAKER_01",
          text: "Hi there",
          startTimeMs: 1600,
          endTimeMs: 3000,
        },
        {
          speaker: "SPEAKER_00",
          text: "Let us start",
          startTimeMs: 3200,
          endTimeMs: 5000,
        },
      ],
    };
    const body = JSON.stringify(payload);
    const now = Math.floor(Date.now() / 1000);
    const req = createSignedRequest(body, now);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify DB update and insert
    expect(db.update).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(redis.del).toHaveBeenCalledWith(`transcription:progress:${transcriptionId}:last`);
  });

  it("handles empty segments gracefully and updates transcription", async () => {
    const payload = {
      transcriptionId,
      status: "completed",
      summary: null,
      metadata: {
        durationSeconds: 10,
        model: "turbo" as const,
        originalFilename: "empty.mp3",
        language: "en",
      },
      segments: undefined, // Option: empty or not provided
    };
    const body = JSON.stringify(payload);
    const now = Math.floor(Date.now() / 1000);
    const req = createSignedRequest(body, now);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.insert).not.toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });

  it("returns 500 if database update fails", async () => {
    vi.spyOn(db, "update").mockImplementationOnce(() => {
      throw new Error("DB Connection Lost");
    });

    const payload = {
      transcriptionId,
      status: "failed",
    };
    const body = JSON.stringify(payload);
    const now = Math.floor(Date.now() / 1000);
    const req = createSignedRequest(body, now);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Internal server error");
  });
});
