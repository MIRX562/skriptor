import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface SegmentUpdate {
  id: string;
  text: string;
  speaker?: string | null;
}

async function saveSegments(
  id: string,
  segments: SegmentUpdate[]
): Promise<void> {
  const res = await fetch(`/api/transcription/${id}/segments`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ segments }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to save segments");
  }
}

export function useSaveSegments(transcriptionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (segments: SegmentUpdate[]) =>
      saveSegments(transcriptionId, segments),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transcription", transcriptionId],
      });
    },
  });
}
