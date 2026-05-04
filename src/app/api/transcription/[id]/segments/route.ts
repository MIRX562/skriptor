import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transcriptions, segments } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const speakerSchema = z.object({
  index: z.number().int().positive(),
  label: z.string().min(1).max(100),
});

const segmentsUpdateSchema = z.object({
  segments: z.array(
    z.object({
      id: z.string().uuid(),
      text: z.string(),
      speakerIndex: z.number().int().nullable().optional(),
    })
  ),
  // Optionally update speaker labels (full replacement)
  speakers: z.array(speakerSchema).optional(),
});

export async function PATCH(
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

    const body = await request.json();
    const parsed = segmentsUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parsed.data.segments;
    const speakersUpdate = parsed.data.speakers;

    // Run segment updates in parallel
    await Promise.all(
      updates.map((updateData) =>
        db
          .update(segments)
          .set({
            text: updateData.text,
            speakerIndex: updateData.speakerIndex ?? null,
          })
          .where(
            and(
              eq(segments.id, updateData.id),
              eq(segments.transcriptionId, id)
            )
          )
      )
    );

    // Update speaker labels on the parent transcription if provided
    if (speakersUpdate !== undefined) {
      await db
        .update(transcriptions)
        .set({ speakers: speakersUpdate })
        .where(eq(transcriptions.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating segments:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
