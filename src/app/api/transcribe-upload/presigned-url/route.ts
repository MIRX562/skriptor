import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getUploadUrl } from "@/lib/storage";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ success: false, error: "Missing filename or contentType" }, { status: 400 });
    }

    // Sanitize title for filename
    const cleanTitle = filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const uniqueId = randomUUID();
    const storageKey = `${session.user.id}-${uniqueId}-${cleanTitle}`;

    const uploadUrl = await getUploadUrl(storageKey, contentType);

    return NextResponse.json({
      success: true,
      uploadUrl,
      storageKey,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
