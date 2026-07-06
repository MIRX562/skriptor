import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSettingsStore } from "../settings-store";

describe("Settings Store", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      theme: "system",
      emailNotifications: true,
      pushNotifications: true,
      defaultLanguage: "en",
      defaultSpeakerIdentification: true,
      defaultTranscriptionMode: "standard",
      preferences: {},
      hasLoaded: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it("fetchSettings fetches and hydrates the store", async () => {
    const mockSettings = {
      success: true,
      data: {
        theme: "dark",
        emailNotifications: false,
        pushNotifications: true,
        defaultLanguage: "es",
        defaultSpeakerIdentification: false,
        defaultTranscriptionMode: "turbo",
        preferences: { completedTours: { dashboard: true } },
      },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSettings,
    });

    await useSettingsStore.getState().fetchSettings();

    const state = useSettingsStore.getState();
    expect(state.theme).toBe("dark");
    expect(state.emailNotifications).toBe(false);
    expect(state.defaultLanguage).toBe("es");
    expect(state.preferences).toEqual({ completedTours: { dashboard: true } });
    expect(state.hasLoaded).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("updateSetting updates the store and calls patch API", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: { 
          theme: "light",
          emailNotifications: true,
          pushNotifications: true,
          defaultLanguage: "en",
          defaultSpeakerIdentification: true,
          defaultTranscriptionMode: "standard",
          preferences: {},
        } 
      }),
    });

    await useSettingsStore.getState().updateSetting("theme", "light");

    expect(useSettingsStore.getState().theme).toBe("light");
    expect(global.fetch).toHaveBeenCalledWith("/api/settings", expect.objectContaining({
      method: "PATCH",
      body: JSON.stringify({ theme: "light" }),
    }));
  });

  it("updatePreference merges preference values and triggers PATCH", async () => {
    useSettingsStore.setState({ preferences: { key1: "val1" } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true, 
        data: { 
          theme: "system",
          emailNotifications: true,
          pushNotifications: true,
          defaultLanguage: "en",
          defaultSpeakerIdentification: true,
          defaultTranscriptionMode: "standard",
          preferences: { key1: "val1", key2: "val2" } 
        } 
      }),
    });

    await useSettingsStore.getState().updatePreference("key2", "val2");

    expect(useSettingsStore.getState().preferences).toEqual({ key1: "val1", key2: "val2" });
  });
});
