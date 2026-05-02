import { useEffect, useState } from "react";
import { getPendingJob, clearPendingJob } from "@/lib/pending-job";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function useProcessPendingJob() {
  const [isProcessingPendingJob, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const processJob = async () => {
      try {
        const file = await getPendingJob();
        if (!file) return;

        setIsProcessing(true);
        toast.info("Processing your pending transcription job...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", "Untitled Transcription");
        formData.append("language", "default");
        formData.append("model", "medium");
        formData.append("isSpeakerDiarized", "false");
        formData.append("numberOfSpeaker", "1");

        const response = await fetch("/api/transcribe-upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error ? JSON.stringify(data.error) : "Upload failed.");
        }

        toast.success("Transcription started successfully.");
        await clearPendingJob();
        
        // Invalidate the transcriptions list to show the new item
        queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
      } catch (error) {
        console.error("Pending job processing error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to process pending job.");
        // We do not clear the job on error so they can try again or we can let them handle it.
        // Or we clear it so it doesn't get stuck forever. Let's clear it if it's a hard error to prevent infinite loops.
        await clearPendingJob();
      } finally {
        setIsProcessing(false);
      }
    };

    processJob();
  }, [queryClient]);

  return { isProcessingPendingJob };
}
