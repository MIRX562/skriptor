import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpellcheckHighlighter } from "../spellcheck-highlighter";
import { useSpellcheckStore } from "../../store/spellcheck-store";

describe("SpellcheckHighlighter Component", () => {
  it("renders text normally when spellcheck is disabled", () => {
    useSpellcheckStore.setState({ isEnabled: false });
    render(<SpellcheckHighlighter text="Hello wrold" segmentIndex={0} />);
    
    expect(screen.getByText("Hello wrold")).toBeInTheDocument();
  });

  it("highlights spelling errors when spellcheck is enabled", () => {
    useSpellcheckStore.setState({
      isEnabled: true,
      customWords: new Set(),
      ignoredWords: new Set(),
    });
    
    // Mock the checkText store method
    vi.spyOn(useSpellcheckStore.getState(), "checkText").mockReturnValue([
      { word: "wrold", start: 6, end: 11, suggestions: ["world", "would"] },
    ]);

    render(<SpellcheckHighlighter text="Hello wrold" segmentIndex={0} />);

    expect(screen.getByText("Hello")).toBeInTheDocument();
    
    const errorSpan = screen.getByText("wrold");
    expect(errorSpan).toBeInTheDocument();
    expect(errorSpan).toHaveClass("underline");
  });
});
