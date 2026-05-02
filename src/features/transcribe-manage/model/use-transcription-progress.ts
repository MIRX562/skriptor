import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface ProgressEvent {
  id: string;
  status: "pending" | "processing" | "completed" | "error";
  progress: number;
  message: string;
}

export function useTranscriptionProgress(
  transcriptionId: string,
  initialStatus: string
) {
  const [progressState, setProgressState] = useState<ProgressEvent | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // We only need to listen to SSE if the transcription is not completed or failed.
    if (initialStatus === "completed" || initialStatus === "failed") {
      return;
    }

    const eventSource = new EventSource(
      `/api/transcription/${transcriptionId}/sse`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ProgressEvent;
        setProgressState(data);

        // If the worker has finished processing, close SSE and refetch data
        if (data.status === "completed" || data.status === "error") {
          eventSource.close();
          // Wait a moment for backend to settle (e.g. database updates)
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
            queryClient.invalidateQueries({
              queryKey: ["transcription", transcriptionId],
            });
          }, 1000);
        }
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [transcriptionId, initialStatus, queryClient]);

  return progressState;
}
