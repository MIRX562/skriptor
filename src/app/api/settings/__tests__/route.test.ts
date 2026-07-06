import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "../route";
import { db } from "@/db";

vi.mock("@/db", () => {
  const mockInsert = vi.fn().mockImplementation(() => ({
    values: vi.fn().mockImplementation(() => ({
      returning: vi.fn().mockResolvedValue([{ id: "new-settings-id", theme: "system", preferences: {} }]),
    })),
  }));

  const mockUpdate = vi.fn().mockImplementation(() => ({
    set: vi.fn().mockImplementation(() => ({
      where: vi.fn().mockImplementation(() => ({
        returning: vi.fn().mockResolvedValue([{ id: "updated-settings-id", theme: "dark", preferences: {} }]),
      })),
    })),
  }));

  return {
    db: {
      insert: mockInsert,
      update: mockUpdate,
      query: {
        userSettings: {
          findFirst: vi.fn(),
        },
      },
    },
  };
});

describe("Settings API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns settings if found", async () => {
    const mockRecord = { id: "1", userId: "test-user-id", theme: "dark", preferences: {} };
    vi.spyOn(db.query.userSettings, "findFirst").mockResolvedValue(mockRecord as any);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.theme).toBe("dark");
  });

  it("GET inserts default settings if not found", async () => {
    vi.spyOn(db.query.userSettings, "findFirst").mockResolvedValue(null as any);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.insert).toHaveBeenCalled();
  });

  it("PATCH returns 400 if validation fails", async () => {
    const mockReq = {
      json: async () => ({ theme: "invalid-theme" }),
    } as unknown as Request;

    const res = await PATCH(mockReq);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });
});
