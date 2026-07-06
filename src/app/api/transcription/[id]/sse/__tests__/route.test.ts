import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { redis } from "@/lib/redis";
import { NextRequest } from "next/server";

describe("Transcription SSE API Route (GET)", () => {
  const transId = "test-trans-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if transcriptionId is invalid or missing", async () => {
    const req = new NextRequest("http://localhost");
    const res = await GET(req, { params: Promise.resolve({ id: "" }) });

    expect(res.status).toBe(400);
    const body = await res.text();
    expect(body).toBe("Invalid transcription ID");
  });

  it("successfully creates SSE stream and subscribes to Redis channel", async () => {
    const mockSubscriber = {
      subscribe: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      unsubscribe: vi.fn(),
      quit: vi.fn(),
    };
    vi.spyOn(redis, "duplicate").mockReturnValue(mockSubscriber as any);
    vi.spyOn(redis, "get").mockResolvedValue(JSON.stringify({ status: "processing", progress: 50 }));

    const req = new NextRequest("http://localhost");
    const res = await GET(req, { params: Promise.resolve({ id: transId }) });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(redis.duplicate).toHaveBeenCalled();
    expect(mockSubscriber.subscribe).toHaveBeenCalledWith(`transcription:progress:${transId}`);
  });
});
