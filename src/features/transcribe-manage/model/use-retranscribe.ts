import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RetranscribeOptions {
  language: string;
  model: "small" | "turbo" | "large";
  isSpeakerDiarized: boolean;
  numberOfSpeaker: number;
}

async function retranscribeTranscription(id: string, options: RetranscribeOptions): Promise<void> {
  const res = await fetch(`/api/transcription/${id}/retranscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? "Failed to re-transcribe transcription");
  }
}

export function useRetranscribe(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: RetranscribeOptions) => retranscribeTranscription(id, options),
    onSuccess: () => {
      // Invalidate the specific transcription and the list
      queryClient.invalidateQueries({ queryKey: ["transcription", id] });
      queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
    },
  });
}
