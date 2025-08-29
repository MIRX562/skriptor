import { z } from "zod";

export const transcriptionUploadSchema = z
  .object({
    file: z
      .array(
        z.instanceof(File).refine((file) => file.size < 50 * 1024 * 1024, {
          message: "File size must be less than 50MB",
        })
      )
      .max(1, {
        message: "Maximum 1 file allowed",
      }),
    title: z.string(),
    language: z.string(),
    model: z.enum(["small", "medium", "large"]),
    isSpeakerDiarized: z.boolean(),
    numberOfSpeaker: z.coerce.number().min(1).max(10),
  })
  .refine(
    (data) =>
      !data.isSpeakerDiarized ||
      (data.isSpeakerDiarized && data.numberOfSpeaker !== undefined),
    {
      message: "Speaker count is required when speaker is true",
      path: ["speaker_count"],
    }
  );
