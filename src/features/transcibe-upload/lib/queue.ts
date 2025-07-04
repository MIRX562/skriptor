import { redis } from "@/lib/redis";

export async function enqueueTranscriptionJob(data: {
  transcriptionId: string;
  filename: string;
  language: string;
  model: "small" | "medium" | "Large";
  isSpeakerDiarized: boolean;
  numberOfSpeaker: number;
}) {
  await redis.lpush("transcription:queue", JSON.stringify(data));
}
