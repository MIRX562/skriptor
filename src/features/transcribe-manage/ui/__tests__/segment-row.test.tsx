import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SegmentRow } from "../segment-row";
import type { TranscriptionSegment } from "../../store/transcription-view-store";

describe("SegmentRow Component", () => {
  const mockSegment: TranscriptionSegment = {
    id: "seg-1",
    speakerIndex: null,
    text: "Sample segment text",
    start: 1000,
    end: 3000,
  };

  it("renders segment text in read-only mode", () => {
    render(
      <SegmentRow
        segment={mockSegment}
        index={0}
        speakers={[]}
        isEditing={false}
        isActive={false}
        isSearchMatch={false}
        isCurrentSearchMatch={false}
        isSpeakerDiarized={false}
        onSegmentClick={vi.fn()}
        onTextChange={vi.fn()}
        onSpeakerChange={vi.fn()}
      />
    );

    expect(screen.getByText("Sample segment text")).toBeInTheDocument();
  });

  it("renders a textarea in edit mode and triggers onChange", () => {
    const handleTextChange = vi.fn();
    render(
      <SegmentRow
        segment={mockSegment}
        index={0}
        speakers={[]}
        isEditing={true}
        isActive={false}
        isSearchMatch={false}
        isCurrentSearchMatch={false}
        isSpeakerDiarized={false}
        onSegmentClick={vi.fn()}
        onTextChange={handleTextChange}
        onSpeakerChange={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText("Enter segment text...");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue("Sample segment text");

    fireEvent.change(textarea, { target: { value: "Changed text" } });
    expect(handleTextChange).toHaveBeenCalledWith(0, "Changed text");
  });
});
