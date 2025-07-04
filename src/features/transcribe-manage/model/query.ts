"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getTranscriptionById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    const result = await db.query.transcriptions.findFirst({
      where: (transcriptions, { and, eq }) =>
        and(
          eq(transcriptions.uuid, id),
          eq(transcriptions.userId, session.user.id)
        ),
      with: {
        segments: {
          orderBy: (segments, { asc }) => [asc(segments.startTime)],
          with: {
            speaker: true,
          },
        },
        speakers: true,
      },
    });

    if (!result) {
      return { error: "Transcription not found" };
    }

    return { data: result };
  } catch (error) {
    console.error("Error fetching transcription:", error);
    return { error: "Failed to fetch transcription" };
  }
}

export async function getTranscripstionList() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("not authenticated");
    const data = await db
      .select()
      .from(transcriptions)
      .where(eq(transcriptions.userId, session.user.id));
    if (!data) return null;
    return data;
  } catch (error) {
    console.error(error);
  }
}
