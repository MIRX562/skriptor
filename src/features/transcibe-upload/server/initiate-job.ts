"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { db } from "@/db";
import { transcriptions } from "@/db/schema";
import { redis } from "@/lib/redis";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
// import { z } from "zod";
import { transcriptionUploadSchema } from "../schema/transcription-upload-schema";

const s3 = new S3Client({
  endpoint: process.env.MINIO_URL!,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

async function enqueueTranscriptionJob(data: {
  transcriptionId: string;
  filename: string;
  language: string;
  model: "small" | "medium" | "large";
  isSpeakerDiarized: boolean;
  numberOfSpeaker: number;
}) {
  await redis.lpush("transcription:queue", JSON.stringify(data));
}

export async function initiateJob(input: unknown) {
  // Validate input using Zod
  const parsed = transcriptionUploadSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid input: " + JSON.stringify(parsed.error.flatten()));
  }
  const data = parsed.data;

  // Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  // File validation
  const audio = data.file;
  if (!(audio instanceof File)) throw new Error("No file uploaded");

  // Generate unique filename
  const ext = (audio.type && audio.type.split("/")[1]) || "webm";
  const uniqueId = randomUUID();
  const filename = `${userId}-${uniqueId}-${data.title}.${ext}`;
  const buffer = Buffer.from(await audio.arrayBuffer());

  // Extract audio metadata (basic: type, size, name, duration if possible)
  let duration: number | undefined = undefined;
  try {
    // Try to extract duration using AudioContext if available (Node.js: use a library, but here just placeholder)
    // In a real Node.js environment, use 'music-metadata' or similar
    // For now, just leave as undefined or set to 0
    duration = 0;
  } catch {
    duration = undefined;
  }
  const metadata = {
    filename,
    originalName: audio.name,
    type: audio.type,
    size: audio.size,
    duration,
  };

  // Upload to S3/Minio
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.MINIO_BUCKET!,
        Key: filename,
        Body: buffer,
        ContentType: audio.type,
      })
    );
  } catch (err) {
    throw new Error(`Failed to upload audio to storage: ${err}`);
  }

  // Insert job in DB
  let job;
  try {
    job = await db
      .insert(transcriptions)
      .values({
        title: data.title,
        language: data.language,
        status: "queued",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        audioUrl: filename,
        metadata,
        model: data.model,
        isSpeakerDiarized: !!data.isSpeakerDiarized,
        numberOfSpeaker: data.numberOfSpeaker,
      })
      .returning();
  } catch (err) {
    throw new Error(`Failed to create transcription job: ${err}`);
  }

  // Enqueue job
  await enqueueTranscriptionJob({
    transcriptionId: job[0].id,
    filename,
    language: job[0].language,
    model: job[0].model,
    isSpeakerDiarized: job[0].isSpeakerDiarized,
    numberOfSpeaker: job[0].numberOfSpeaker,
  });

  return { success: true, transcription: job[0] };
}
