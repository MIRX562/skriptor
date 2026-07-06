import { describe, it, expect } from "vitest";
import { cn, getInitials, formatDate, formatSrtTime, formatTime, formatTimeMMSS } from "../utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("merges tailwind class names successfully", () => {
      expect(cn("px-2", "py-2")).toBe("px-2 py-2");
      expect(cn("px-2", "px-4")).toBe("px-4"); // overrides
      expect(cn("px-2", false && "py-2")).toBe("px-2");
    });
  });

  describe("getInitials", () => {
    it("returns initials for name formats", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("john doe")).toBe("JD");
      expect(getInitials("Single")).toBe("S");
      expect(getInitials("")).toBe("");
      expect(getInitials("  John   Doe  ")).toBe("JD");
      expect(getInitials("First Middle Last")).toBe("FL");
    });
  });

  describe("formatDate", () => {
    it("formats dates and string timestamps correctly", () => {
      const date = new Date(2026, 4, 23); // May 23, 2026
      expect(formatDate(date, "yyyy-MM-dd")).toBe("2026-05-23");
      expect(formatDate("2026-05-23", "dd/MM/yyyy")).toBe("23/05/2026");
      expect(formatDate("invalid-date")).toBe("");
    });
  });

  describe("formatSrtTime", () => {
    it("converts milliseconds into SRT formatted timestamps HH:MM:SS,mmm", () => {
      expect(formatSrtTime(0)).toBe("00:00:00,000");
      expect(formatSrtTime(125)).toBe("00:00:00,125");
      expect(formatSrtTime(65125)).toBe("00:01:05,125"); // 1 min 5 secs
      expect(formatSrtTime(3665125)).toBe("01:01:05,125"); // 1 hour 1 min 5 secs
    });
  });

  describe("formatTime", () => {
    it("converts milliseconds into MM:SS.mmm formatted timestamps", () => {
      expect(formatTime(0)).toBe("00:00.000");
      expect(formatTime(125)).toBe("00:00.125");
      expect(formatTime(65125)).toBe("01:05.125");
      expect(formatTime(3665125)).toBe("61:05.125");
    });
  });

  describe("formatTimeMMSS", () => {
    it("converts milliseconds into MM:SS formatted timestamps", () => {
      expect(formatTimeMMSS(0)).toBe("00:00");
      expect(formatTimeMMSS(125)).toBe("00:00");
      expect(formatTimeMMSS(65125)).toBe("01:05");
      expect(formatTimeMMSS(3665125)).toBe("61:05");
    });
  });
});
