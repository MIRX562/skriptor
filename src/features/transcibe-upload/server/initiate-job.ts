// NOTE: This file is legacy dead code. The upload flow is handled entirely by
// POST /api/transcribe-upload (src/app/api/transcribe-upload/route.ts).
// The upload forms call that API route directly via fetch().
// This file is kept for reference and may be deleted in a future cleanup pass.


import { db } from "@/db";
import { transcriptions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
// import { z } from "zod";
import { transcriptionUploadSchema } from "../schema/transcription-upload-schema";
import { uploadAudio, getPresignedUrl } from "@/lib/storage";
import { transcriptionQueue, TranscriptionJobPayload } from "@/lib/queue";



async function enqueueTranscriptionJob(data: TranscriptionJobPayload) {
  await transcriptionQueue.add("transcribe", data, {
    jobId: data.transcriptionId,
  });
}

export async function initiateJob(input: any) {
  // Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) throw new Error("Not authenticated");
  const userId = session.user.id;

  const { title, language, model, isSpeakerDiarized, numberOfSpeaker, storageKey, file } = input;

  let filename = storageKey;
  let metadata: any = {};

  if (!filename && file instanceof File) {
    // Legacy/Small file path: Upload from server
    const ext = (file.type && file.type.split("/")[1]) || "webm";
    const uniqueId = randomUUID();
    filename = `${userId}-${uniqueId}-${title}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    metadata = {
      filename,
      originalName: file.name,
      type: file.type,
      size: file.size,
      duration: 0,
    };

    try {
      await uploadAudio(buffer, filename, file.type);
    } catch (err) {
      throw new Error(`Failed to upload audio to storage: ${err}`);
    }
  } else if (filename) {
    // New path: File already uploaded to S3 via presigned URL
    // Metadata should ideally be passed in or fetched, but for now we use placeholders
    metadata = {
      filename,
      originalName: title, // Use title as fallback
      size: input.fileSize || 0,
      type: input.fileType || "audio/mpeg",
      duration: 0,
    };
  } else {
    throw new Error("No file or storageKey provided");
  }

  // Insert job in DB
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
        updatedAt: new Date(),
        audioUrl: filename,
        metadata,
        model,
        isSpeakerDiarized: !!isSpeakerDiarized,
        numberOfSpeaker: numberOfSpeaker || 1,
      })
      .returning();
  } catch (err) {
    throw new Error(`Failed to create transcription job: ${err}`);
  }

  // Enqueue job with a 2-hour presigned URL
  const presignedUrl = await getPresignedUrl(filename, 7200);

  await enqueueTranscriptionJob({
    transcriptionId: job[0].id,
    filename,
    audioUrl: presignedUrl,
    language: job[0].language,
    model: job[0].model,
    isSpeakerDiarized: !!job[0].isSpeakerDiarized,
    numberOfSpeaker: job[0].numberOfSpeaker,
  });

  return { success: true, transcription: job[0] };
}
