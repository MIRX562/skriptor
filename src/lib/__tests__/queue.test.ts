import { describe, it, expect } from "vitest";
import { Queue } from "bullmq";
import { transcriptionQueue } from "../queue";
import { redis } from "../redis";

describe("Queue Setup", () => {
  it("initializes the transcription queue with correct parameters", () => {
    expect(Queue).toHaveBeenCalledWith(
      "transcription",
      expect.objectContaining({
        connection: redis,
        defaultJobOptions: expect.objectContaining({
          attempts: 3,
          backoff: expect.objectContaining({ type: "exponential", delay: 5000 }),
        }),
      })
    );
    expect(transcriptionQueue).toBeDefined();
  });
});
