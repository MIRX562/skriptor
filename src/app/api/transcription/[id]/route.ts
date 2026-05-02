import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transcriptions } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { segments } from "@/db/schema";
import { deleteAudio } from "@/lib/storage";

export async function GET(
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

    const record = await db.query.transcriptions.findFirst({
      where: and(
        eq(transcriptions.id, id),
        eq(transcriptions.userId, session.user.id)
      ),
      with: {
        segments: {
          orderBy: [asc(segments.startTime)],
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "Transcription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Error fetching transcription:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify ownership and get the audio key
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

    // Delete audio from S3 first. If this fails, log and continue so
    // the DB record is still cleaned up (avoids orphaned DB rows).
    if (record.audioUrl) {
      try {
        await deleteAudio(record.audioUrl);
      } catch (s3Err) {
        console.error("S3 deletion failed for key", record.audioUrl, s3Err);
      }
    }

    // Delete DB record (segments cascade via FK)
    await db
      .delete(transcriptions)
      .where(and(eq(transcriptions.id, id), eq(transcriptions.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transcription:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
