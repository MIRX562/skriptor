import { initiateJob } from "@/features/transcibe-upload/server/initiate-job";
import { NextRequest, NextResponse } from "next/server";
import { transcriptionUploadSchema } from "@/features/transcibe-upload/schema/transcription-upload-schema";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title");
    const language = formData.get("language");
    const model = formData.get("model");
    const isSpeakerDiarized = formData.get("isSpeakerDiarized");
    const numberOfSpeaker = formData.get("numberOfSpeaker");

    // Validate file
    if (!file || typeof file !== "object" || !("arrayBuffer" in file)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded." },
        { status: 400 }
      );
    }

    // Validate other fields using zod schema (single file)
    const parsed = transcriptionUploadSchema.safeParse({
      file,
      title,
      language,
      model,
      isSpeakerDiarized:
        typeof isSpeakerDiarized === "string"
          ? isSpeakerDiarized === "true"
          : false,
      numberOfSpeaker: Number(numberOfSpeaker),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Call initiateJob with validated data
    await initiateJob({
      ...parsed.data,
      file, // Pass the file object for further processing
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
