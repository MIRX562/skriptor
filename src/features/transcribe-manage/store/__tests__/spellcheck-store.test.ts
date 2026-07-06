import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSpellcheckStore } from "../spellcheck-store";
import { useSettingsStore } from "@/features/setting/store/settings-store";
import * as spellcheckLib from "@/lib/spellchecker";

vi.mock("@/lib/spellchecker", async (importOriginal) => {
  const actual = await importOriginal<typeof spellcheckLib>();
  return {
    ...actual,
    getSpellchecker: vi.fn().mockResolvedValue({
      correct: vi.fn().mockImplementation((w) => w === "correct"),
      suggest: vi.fn().mockReturnValue(["suggestion"]),
      add: vi.fn(),
      remove: vi.fn(),
    }),
  };
});

describe("Spellcheck Store", () => {
  beforeEach(() => {
    useSpellcheckStore.setState({
      isEnabled: false,
      isLoading: false,
      language: null,
      ignoredWords: new Set<string>(),
      customWords: new Set<string>(),
    });
    vi.clearAllMocks();
  });

  it("toggleEnabled toggles enabled state", () => {
    expect(useSpellcheckStore.getState().isEnabled).toBe(false);
    useSpellcheckStore.getState().toggleEnabled();
    expect(useSpellcheckStore.getState().isEnabled).toBe(true);
  });

  it("ignoreWord adds word to ignored set in lowercase", () => {
    useSpellcheckStore.getState().ignoreWord("TestWord");
    expect(useSpellcheckStore.getState().ignoredWords.has("testword")).toBe(true);
  });

  it("addCustomWord updates customWords and settings preference", async () => {
    const mockUpdatePreference = vi.fn().mockResolvedValue(undefined);
    useSettingsStore.setState({
      preferences: { customDictionary: [] },
      updatePreference: mockUpdatePreference,
    } as any);

    await useSpellcheckStore.getState().addCustomWord("CustomWord");

    expect(useSpellcheckStore.getState().customWords.has("customword")).toBe(true);
    expect(mockUpdatePreference).toHaveBeenCalledWith("customDictionary", ["customword"]);
  });

  it("checkText returns empty if disabled", () => {
    useSpellcheckStore.setState({ isEnabled: false });
    expect(useSpellcheckStore.getState().checkText("some text")).toEqual([]);
  });
});
