import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getPendingJob,
  clearPendingJob,
  DEFAULT_TRANSCRIPTION_TITLE,
} from "@/lib/pending-job";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useProcessPendingJob() {
  const [isProcessingPendingJob, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const processJob = async () => {
      setIsProcessing(true);
      try {
        const file = await getPendingJob();
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", DEFAULT_TRANSCRIPTION_TITLE);
        formData.append("language", "default");
        formData.append("model", "turbo");
        formData.append("isSpeakerDiarized", "false");
        formData.append("numberOfSpeaker", "1");

        const response = await fetch("/api/transcribe-upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(
            data.error ? JSON.stringify(data.error) : "Upload failed.",
          );
        }

        toast.success("Transcription started successfully.");
        await clearPendingJob();
        router.push("/dashboard/manage", { scroll: false });

        // Invalidate the transcriptions list to show the new item
        queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
      } catch (error) {
        console.error("Pending job processing error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to process pending job.",
        );
        // Keep pending job on failure so user can retry after fixing connectivity/auth issues.
      } finally {
        setIsProcessing(false);
      }
    };

    processJob();
  }, [queryClient, router]);

  return { isProcessingPendingJob };
}
