import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { transcriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getPresignedUrl } from "@/lib/storage";

export async function GET(
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

    const record = await db.query.transcriptions.findFirst({
      where: and(
        eq(transcriptions.id, id),
        eq(transcriptions.userId, session.user.id)
      ),
    });

    if (!record || !record.audioUrl) {
      return NextResponse.json(
        { success: false, error: "Transcription audio not found" },
        { status: 404 }
      );
    }

    // Proxy the audio request to bypass CORS
    try {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const { s3, S3_BUCKET } = await import("@/lib/storage");
      const { Readable } = await import("stream");

      const download = new URL(request.url).searchParams.get("download") === "true";
      const range = request.headers.get("range");

      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: record.audioUrl,
        Range: range || undefined,
      });

      const s3Response = await s3.send(command);

      const headers = new Headers();
      if (s3Response.ContentType) headers.set("Content-Type", s3Response.ContentType);
      if (s3Response.ContentLength) headers.set("Content-Length", s3Response.ContentLength.toString());
      if (s3Response.ContentRange) headers.set("Content-Range", s3Response.ContentRange);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "public, max-age=3600");

      if (download) {
        const extension = record.audioUrl.split(".").pop();
        const safeTitle = record.title.replace(/[/\\?%*:|"<>]/g, "-");
        headers.set(
          "Content-Disposition",
          `attachment; filename="${safeTitle}.${extension}"`
        );
      }

      // @ts-ignore - response.Body is a Node stream but Readable.toWeb converts it
      const stream = Readable.toWeb(s3Response.Body as any);

      return new Response(stream as any, {
        status: s3Response.$metadata.httpStatusCode || 200,
        headers,
      });
    } catch (s3Error) {
      console.error("S3 Proxy Error:", s3Error);
      return NextResponse.json(
        { success: false, error: "Failed to stream audio" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating audio stream:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
