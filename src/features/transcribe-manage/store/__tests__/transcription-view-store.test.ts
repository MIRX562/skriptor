import { describe, it, expect, beforeEach } from "vitest";
import { useTranscriptionStore } from "../transcription-view-store";
import type { TranscriptionData } from "../../model/use-transcription";

describe("Transcription View Store", () => {
  beforeEach(() => {
    useTranscriptionStore.setState({
      segments: [],
      speakers: [],
      metadata: null,
      viewMode: "segments",
      isEditing: false,
      isCopied: false,
      showSearch: false,
      searchTerm: "",
      replaceTerm: "",
      searchResults: [],
      currentResultIndex: -1,
    });
  });

  it("initializeFromData hydrates the store with segments and speakers", () => {
    const mockData: TranscriptionData = {
      id: "test-id",
      title: "Test File",
      status: "completed",
      model: "turbo",
      isSpeakerDiarized: true,
      numberOfSpeaker: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-1",
      speakers: [
        { index: 1, label: "Speaker 1" },
        { index: 2, label: "Speaker 2" },
      ],
      segments: [
        { id: "seg-1", startTime: 1000, endTime: 2000, speakerIndex: 1, text: "Hello", transcriptionId: "test-id" },
        { id: "seg-2", startTime: 2000, endTime: 3000, speakerIndex: 2, text: "World", transcriptionId: "test-id" },
      ],
      metadata: { originalFilename: "test.mp3", durationSeconds: 65 },
    };

    useTranscriptionStore.getState().initializeFromData(mockData);

    const state = useTranscriptionStore.getState();
    expect(state.metadata?.id).toBe("test-id");
    expect(state.metadata?.title).toBe("test.mp3");
    expect(state.metadata?.duration).toBe("1:05");
    expect(state.speakers).toHaveLength(2);
    expect(state.segments).toHaveLength(2);
    expect(state.segments[0].text).toBe("Hello");
    expect(state.segments[0].start).toBe(1000);
  });

  it("updateSegment modifies segment field", () => {
    useTranscriptionStore.setState({
      segments: [{ id: "seg-1", speakerIndex: null, text: "Initial", start: 0, end: 1000 }],
    });

    useTranscriptionStore.getState().updateSegment(0, "text", "Updated");
    expect(useTranscriptionStore.getState().segments[0].text).toBe("Updated");
  });

  it("addSpeaker adds a new speaker and returns new index", () => {
    useTranscriptionStore.setState({
      speakers: [{ index: 1, label: "Speaker 1" }],
    });

    const index = useTranscriptionStore.getState().addSpeaker();
    expect(index).toBe(2);
    expect(useTranscriptionStore.getState().speakers).toHaveLength(2);
  });

  it("performSearch returns match indices", () => {
    useTranscriptionStore.setState({
      segments: [
        { id: "s1", text: "Match one", speakerIndex: null, start: 0, end: 1 },
        { id: "s2", text: "something else", speakerIndex: null, start: 1, end: 2 },
        { id: "s3", text: "Match two", speakerIndex: null, start: 2, end: 3 },
      ],
      searchTerm: "match",
    });

    const results = useTranscriptionStore.getState().performSearch();
    expect(results).toEqual([0, 2]);
    expect(useTranscriptionStore.getState().searchResults).toEqual([0, 2]);
  });
});
