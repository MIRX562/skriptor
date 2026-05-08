import { initiateJob } from "@/features/transcibe-upload/server/initiate-job";
import { NextRequest, NextResponse } from "next/server";
import { transcriptionUploadSchema } from "@/features/transcibe-upload/schema/transcription-upload-schema";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const storageKey = formData.get("storageKey");
    const title = formData.get("title");
    const language = formData.get("language");
    const model = formData.get("model");
    const isSpeakerDiarized = formData.get("isSpeakerDiarized");
    const numberOfSpeaker = formData.get("numberOfSpeaker");
    const fileSize = formData.get("fileSize");
    const fileType = formData.get("fileType");

    // Basic validation
    if (!file && !storageKey) {
      return NextResponse.json(
        { success: false, error: "No file or storage key provided." },
        { status: 400 }
      );
    }

    // Call initiateJob with validated data
    await initiateJob({
      title: title as string,
      language: language as string,
      model: model as string,
      isSpeakerDiarized: isSpeakerDiarized === "true",
      numberOfSpeaker: Number(numberOfSpeaker),
      storageKey: storageKey as string,
      file,
      fileSize: Number(fileSize),
      fileType: fileType as string,
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
