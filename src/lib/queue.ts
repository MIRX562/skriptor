import { Queue } from "bullmq";
import { redis } from "./redis";

export interface TranscriptionJobPayload {
  transcriptionId: string;
  filename: string;
  audioUrl: string;
  language: string;
  model: "small" | "medium" | "large";
  isSpeakerDiarized: boolean;
  numberOfSpeaker: number;
}

export const transcriptionQueue = new Queue<TranscriptionJobPayload>("transcription", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});
