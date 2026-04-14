import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { transcriptions, segments } from "@/db/schema";
import { redis } from "@/lib/redis";

const callbackSchema = z.object({
  transcriptionId: z.string().uuid(),
  status: z.enum(["completed", "failed"]),
  summary: z.string().nullable().optional(),
  metadata: z
    .object({
      durationSeconds: z.number().optional(),
      model: z.enum(["small", "medium", "large"]).optional(),
      originalFilename: z.string().optional(),
      mimeType: z.string().optional(),
      sizeBytes: z.number().optional(),
    })
    .optional(),
  segments: z
    .array(
      z.object({
        speaker: z.string().nullable().optional(),
        text: z.string(),
        startTimeMs: z.number().int(),
        endTimeMs: z.number().int(),
      })
    )
    .nonempty()
    .optional(),
});

function verifySignature(sharedSecret: string, req: Request, rawBody: string) {
  const ts = req.headers.get("x-worker-timestamp");
  const sig = req.headers.get("x-worker-signature");
  if (!ts || !sig) return false;

  // Allow 120s drift
  const now = Math.floor(Date.now() / 1000);
  const tsNum = Number(ts);
  if (Number.isNaN(tsNum) || Math.abs(now - tsNum) > 120) return false;

  const hmac = crypto.createHmac("sha256", sharedSecret);
  hmac.update(ts + "." + rawBody);
  const expected = `sha256=${hmac.digest("hex")}`;

  // constant time compare
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const sharedSecret = process.env.WORKER_SHARED_SECRET;
    if (!sharedSecret) {
      console.error("WORKER_SHARED_SECRET not configured");
      return NextResponse.json(
        { success: false, error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (!verifySignature(sharedSecret, req, rawBody)) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const parsed = callbackSchema.safeParse(JSON.parse(rawBody));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    // Update transcription status and metadata
    if (payload.status === "failed") {
      await db
        .update(transcriptions)
        .set({
          status: "failed",
          summary: null,
          metadata: payload.metadata
            ? (payload.metadata as unknown)
            : undefined,
          updatedAt: new Date(),
        })
        .where(eq(transcriptions.id, payload.transcriptionId));

      // clear progress key
      await redis.del(`transcription:progress:${payload.transcriptionId}:last`);

      return NextResponse.json({ success: true });
    }

    // payload.status === 'completed'
    const segs = payload.segments ?? [];

    // Insert segments
    if (segs.length > 0) {
      const now = new Date();
      const values = segs.map((s) => ({
        transcriptionId: payload.transcriptionId,
        speaker: s.speaker ?? null,
        text: s.text,
        startTime: Math.floor(s.startTimeMs),
        endTime: Math.floor(s.endTimeMs),
        createdAt: now,
        updatedAt: now,
      }));

      // Using drizzle insert
      await db.insert(segments).values(values).returning();
    }

    // Update transcription row
    await db
      .update(transcriptions)
      .set({
        status: "completed",
        summary: payload.summary ?? null,
        metadata: payload.metadata ? (payload.metadata as unknown) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(transcriptions.id, payload.transcriptionId));

    // cleanup progress key
    await redis.del(`transcription:progress:${payload.transcriptionId}:last`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("worker-callback error", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
