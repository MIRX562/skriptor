import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Speaker } from "./use-transcription";

export interface SegmentUpdate {
  id: string;
  text: string;
  speakerIndex?: number | null;
}

export interface SaveSegmentsPayload {
  segments: SegmentUpdate[];
  speakers?: Speaker[];
}

async function saveSegments(
  id: string,
  payload: SaveSegmentsPayload
): Promise<void> {
  const res = await fetch(`/api/transcription/${id}/segments`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to save segments");
  }
}

export function useSaveSegments(transcriptionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveSegmentsPayload) =>
      saveSegments(transcriptionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transcription", transcriptionId],
      });
    },
  });
}
