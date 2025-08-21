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
    language: z.string(),
    model: z.string(),
    speaker: z.boolean(),
    speaker_count: z.coerce.number().min(1).max(10).optional(),
  })
  .refine(
    (data) =>
      !data.speaker || (data.speaker && data.speaker_count !== undefined),
    {
      message: "Speaker count is required when speaker is true",
      path: ["speaker_count"],
    }
  );
