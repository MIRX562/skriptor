import { useQuery } from "@tanstack/react-query";

export interface TranscriptionListItem {
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
}

async function fetchTranscriptionList(): Promise<TranscriptionListItem[]> {
  const res = await fetch("/api/transcriptions");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to fetch transcriptions");
  }
  const json = await res.json();
  return json.data as TranscriptionListItem[];
}

export function useTranscriptionList() {
  return useQuery({
    queryKey: ["transcriptions"],
    queryFn: fetchTranscriptionList,
  });
}
