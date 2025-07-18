"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { db } from "@/db";
import { transcriptions } from "@/db/schema";
import { enqueueTranscriptionJob } from "../lib/queue";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  endpoint: process.env.MINIO_URL!,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function uploadAudio(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Not authenticated");

  const audio = formData.get("audio");
  if (!(audio instanceof File)) throw new Error("No file uploaded");

  const title = formData.get("title");
  if (typeof title !== "string" || !title.trim())
    throw new Error("No title provided");

  const language = formData.get("language");
  if (typeof language !== "string" || !language.trim())
    throw new Error("No language provided");

  const userId = session.user.id;
  // Generate a unique filename to avoid overwriting
  const ext = (audio.type && audio.type.split("/")[1]) || "webm";
  const uniqueId = randomUUID();
  const filename = `${userId}-${uniqueId}.${ext}`;

  const buffer = Buffer.from(await audio.arrayBuffer());

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
    throw new Error("Failed to upload audio to storage");
  }

  let job;
  try {
    job = await db
      .insert(transcriptions)
      .values({
        title,
        language,
        status: "queued",
        userId,
        createdAt: new Date(),
        metadata: { filename },
      })
      .returning();
  } catch (err) {
    throw new Error("Failed to create transcription job");
  }

  await enqueueTranscriptionJob({
    transcriptionId: job[0].id,
    filename,
    language,
    model: "small",
    isSpeakerDiarized: false,
    numberOfSpeaker: 1,
  });

  return { success: true, transcription: job[0] };
}
