import { useQuery } from "@tanstack/react-query";

export interface TranscriptionSegmentData {
  id: string;
  speaker: string | null;
  text: string;
  startTime: number;
  endTime: number;
  transcriptionId: string;
}

export interface TranscriptionData {
  id: string;
  title: string;
  status: "queued" | "processing" | "completed" | "failed";
  model: "small" | "medium" | "large";
  language: string;
  isSpeakerDiarized: boolean;
  numberOfSpeaker: number;
  audioUrl: string;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  segments: TranscriptionSegmentData[];
}

async function fetchTranscription(id: string): Promise<TranscriptionData> {
  const res = await fetch(`/api/transcription/${id}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to fetch transcription");
  }
  const json = await res.json();
  return json.data as TranscriptionData;
}

export function useTranscription(id: string) {
  return useQuery({
    queryKey: ["transcription", id],
    queryFn: () => fetchTranscription(id),
    enabled: !!id,
  });
}
