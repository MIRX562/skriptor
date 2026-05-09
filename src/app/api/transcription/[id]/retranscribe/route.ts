import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transcriptions, segments } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { transcriptionQueue } from "@/lib/queue";
import { getPresignedUrl } from "@/lib/storage";
import { z } from "zod";

const retranscribeSchema = z.object({
  language: z.string().min(1),
  model: z.enum(["small", "turbo", "large"]),
  isSpeakerDiarized: z.boolean(),
  numberOfSpeaker: z.number().min(1).max(10),
});

export async function POST(
  request: Request,
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
    const body = await request.json();
    
    const parsed = retranscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { language, model, isSpeakerDiarized, numberOfSpeaker } = parsed.data;

    // Verify ownership
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

    // 1. Delete existing segments
    await db.delete(segments).where(eq(segments.transcriptionId, id));

    // 2. Update transcription metadata and status
    await db
      .update(transcriptions)
      .set({
        language,
        model,
        isSpeakerDiarized,
        numberOfSpeaker,
        status: "queued",
        updatedAt: new Date(),
        // Clear summary as it will be regenerated
        summary: null,
      })
      .where(and(eq(transcriptions.id, id), eq(transcriptions.userId, session.user.id)));

    // 3. Generate a fresh presigned URL for the worker (1-hour TTL)
    const audioUrl = await getPresignedUrl(record.audioUrl, 3600);

    // 4. Re-enqueue the job
    await transcriptionQueue.add(
      "transcribe",
      {
        transcriptionId: record.id,
        filename: record.audioUrl,
        audioUrl,
        language,
        model,
        isSpeakerDiarized,
        numberOfSpeaker,
      },
      {
        jobId: `${record.id}-retranscribe-${Date.now()}`,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error re-transcribing:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
