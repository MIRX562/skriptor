import { useMutation, useQueryClient } from "@tanstack/react-query";

async function retryTranscription(id: string): Promise<void> {
  const res = await fetch(`/api/transcription/${id}/retry`, {
    method: "POST",
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? "Failed to retry transcription");
  }
}

export function useRetryTranscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryTranscription,
    onSuccess: (_data, id) => {
      // Invalidate the specific transcription (status flipped to queued)
      // and the list so the status badge updates immediately
      queryClient.invalidateQueries({ queryKey: ["transcription", id] });
      queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
    },
  });
}
