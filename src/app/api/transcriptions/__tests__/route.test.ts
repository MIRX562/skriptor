import { describe, it, expect, vi } from "vitest";
import { GET } from "../route";

vi.mock("@/db", () => {
  const mockSelect = vi.fn().mockImplementation(() => ({
    from: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockImplementation(() => ({
        orderBy: vi.fn().mockResolvedValue([{ id: "t-1", title: "Transcription 1" }]),
      })),
    })),
  }));
  
  return {
    db: {
      select: mockSelect,
    },
  };
});

describe("Transcriptions API Route", () => {
  it("GET returns transcriptions list for the authorized user", async () => {
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([{ id: "t-1", title: "Transcription 1" }]);
  });
});
