import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteTranscription(id: string): Promise<void> {
  const res = await fetch(`/api/transcription/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete transcription");
  }
}

export function useDeleteTranscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTranscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcriptions"] });
    },
  });
}
