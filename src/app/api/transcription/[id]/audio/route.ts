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

    const download = new URL(request.url).searchParams.get("download") === "true";
    let downloadFilename;
    
    if (download) {
      const extension = record.audioUrl.split(".").pop();
      const safeTitle = record.title.replace(/[/\\?%*:|"<>]/g, "-");
      downloadFilename = `${safeTitle}.${extension}`;
    }

    const url = await getPresignedUrl(record.audioUrl, 3600, downloadFilename);

    if (download) {
      return NextResponse.redirect(url);
    }

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Error generating audio URL:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
