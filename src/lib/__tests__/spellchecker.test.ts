import { describe, it, expect, vi } from "vitest";
import { mapLanguageCode, extractWords, checkText, getSpellchecker } from "../spellchecker";
import type { Spellchecker } from "nspell";

vi.mock("nspell", () => ({
  default: vi.fn().mockImplementation(() => ({
    correct: vi.fn(),
    suggest: vi.fn(),
  })),
}));

describe("Spellchecker Utility", () => {
  describe("mapLanguageCode", () => {
    it("maps codes correctly", () => {
      expect(mapLanguageCode("en-US")).toBe("en");
      expect(mapLanguageCode("id")).toBe("id");
      expect(mapLanguageCode("default")).toBe("en");
      expect(mapLanguageCode("unknown-code")).toBe("en"); // fallback
    });
  });

  describe("extractWords", () => {
    it("extracts words with correct offsets", () => {
      const text = "Hello, world! This is a test.";
      const words = extractWords(text);
      expect(words).toEqual([
        { word: "Hello", start: 0, end: 5 },
        { word: "world", start: 7, end: 12 },
        { word: "This", start: 14, end: 18 },
        { word: "is", start: 19, end: 21 },
        { word: "test", start: 24, end: 28 },
      ]);
    });

    it("cleans surrounding punctuation", () => {
      const text = " 'hello' -world- ";
      const words = extractWords(text);
      expect(words).toEqual([
        { word: "hello", start: 2, end: 7 },
        { word: "world", start: 10, end: 15 },
      ]);
    });
  });

  describe("checkText", () => {
    it("identifies misspelled words using a mocked spellchecker", () => {
      const mockSpellchecker = {
        correct: vi.fn().mockImplementation((w) => w === "Hello" || w === "world"),
        suggest: vi.fn().mockImplementation((w) => w === "wrold" ? ["world"] : []),
        add: vi.fn(),
        remove: vi.fn(),
      } as unknown as Spellchecker;

      const text = "Hello wrold";
      const misspelled = checkText(text, mockSpellchecker);

      expect(misspelled).toEqual([
        { word: "wrold", start: 6, end: 11, suggestions: ["world"] }
      ]);
    });

    it("ignores words in ignored list", () => {
      const mockSpellchecker = {
        correct: vi.fn().mockReturnValue(false),
        suggest: vi.fn().mockReturnValue([]),
      } as unknown as Spellchecker;

      const ignored = new Set(["ignored"]);
      const misspelled = checkText("hello ignored", mockSpellchecker, ignored);

      expect(misspelled).toHaveLength(1);
      expect(misspelled[0].word).toBe("hello");
    });
  });

  describe("getSpellchecker", () => {
    it("fetches dictionaries and creates nspell instance, then uses cache", async () => {
      const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        text: async () => "mock-content",
      } as any);

      const spellchecker = await getSpellchecker("id");
      expect(spellchecker).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Cache hit test
      const cached = await getSpellchecker("id");
      expect(cached).toBe(spellchecker);
      expect(mockFetch).toHaveBeenCalledTimes(2); // should not fetch again
    });

    it("returns null and caches it if fetch fails", async () => {
      const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
      } as any);

      const spellchecker = await getSpellchecker("es");
      expect(spellchecker).toBeNull();

      // Verify cached null works without fetching again
      const cached = await getSpellchecker("es");
      expect(cached).toBeNull();
    });
  });
});
