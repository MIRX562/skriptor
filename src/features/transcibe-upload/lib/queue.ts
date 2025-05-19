import { redis } from "@/lib/redis";

export async function enqueueTranscriptionJob(data: {
  transcriptionId: string;
  filename: string;
  language: string;
}) {
  await redis.lpush("transcription:queue", JSON.stringify(data));
}
