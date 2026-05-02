import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transcriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { transcriptionQueue } from "@/lib/queue";
import { getPresignedUrl } from "@/lib/storage";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership and ensure the transcription is in a failed state
    const record = await db.query.transcriptions.findFirst({
      where: and(
        eq(transcriptions.id, id),
        eq(transcriptions.userId, session.user.id)
      ),
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Transcription not found" },
        { status: 404 }
      );
    }

    if (record.status !== "failed") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot retry a transcription with status "${record.status}". Only failed transcriptions can be retried.`,
        },
        { status: 400 }
      );
    }

    // Generate a fresh presigned URL for the worker (1-hour TTL)
    const audioUrl = await getPresignedUrl(record.audioUrl, 3600);

    // Reset status back to queued
    await db
      .update(transcriptions)
      .set({ status: "queued", updatedAt: new Date() })
      .where(and(eq(transcriptions.id, id), eq(transcriptions.userId, session.user.id)));

    // Re-enqueue the job — use the transcription id as jobId for idempotency
    await transcriptionQueue.add(
      "transcribe",
      {
        transcriptionId: record.id,
        filename: record.audioUrl,
        audioUrl,
        language: record.language,
        model: record.model,
        isSpeakerDiarized: record.isSpeakerDiarized,
        numberOfSpeaker: record.numberOfSpeaker,
      },
      {
        // Use a unique jobId so BullMQ doesn't deduplicate against the old completed/failed job
        jobId: `${record.id}-retry-${Date.now()}`,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error retrying transcription:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
