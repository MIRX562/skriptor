import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type TourStatus = "completed" | "skipped" | "dismissed" | null;

export type TourKey = "dashboard" | "editor";

export interface UserSettingsData {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  pushNotifications: boolean;
  defaultLanguage: string;
  defaultSpeakerIdentification: boolean;
  defaultTranscriptionMode: string;
  preferences: {
    completedTours?: Partial<Record<TourKey, boolean>>;
    skippedTours?: Partial<Record<TourKey, boolean>>;
    dismissedTours?: Partial<Record<TourKey, boolean>>;
    customDictionary?: string[];
    [key: string]: unknown;
  };
}

interface SettingsState extends UserSettingsData {
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;

  fetchSettings: () => Promise<void>;
  updateSetting: (key: keyof UserSettingsData, value: UserSettingsData[keyof UserSettingsData]) => Promise<void>;
  updatePreference: (key: string, value: unknown) => Promise<void>;
  saveSettings: (data: Partial<UserSettingsData>) => Promise<void>;

  setTourStatus: (tourKey: TourKey, status: TourStatus) => Promise<void>;
  restartTour: (tourKey: TourKey) => Promise<void>;
  getTourStatus: (tourKey: TourKey) => TourStatus;
}

const defaultSettings: UserSettingsData = {
  theme: "system",
  emailNotifications: true,
  pushNotifications: true,
  defaultLanguage: "en",
  defaultSpeakerIdentification: true,
  defaultTranscriptionMode: "standard",
  preferences: {},
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      ...defaultSettings,
      isLoading: false,
      error: null,
      hasLoaded: false,

      fetchSettings: async () => {
        if (get().hasLoaded) return;
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/settings");
          if (!res.ok) throw new Error("Failed to fetch settings");
          const result = await res.json();
          if (result.success && result.data) {
            set({
              theme: result.data.theme || "system",
              emailNotifications: result.data.emailNotifications ?? true,
              pushNotifications: result.data.pushNotifications ?? true,
              defaultLanguage: result.data.defaultLanguage || "en",
              defaultSpeakerIdentification: result.data.defaultSpeakerIdentification ?? true,
              defaultTranscriptionMode: result.data.defaultTranscriptionMode || "standard",
              preferences: result.data.preferences || {},
              hasLoaded: true,
            });
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
          set({ error: "Failed to load settings from server" });
        } finally {
          set({ isLoading: false });
        }
      },

      updateSetting: async (key, value) => {
        set({ [key]: value });
        await get().saveSettings({ [key]: value });
      },

      updatePreference: async (key, value) => {
        const currentPrefs = get().preferences;
        const newPrefs = {
          ...currentPrefs,
          [key]: value,
        };
        set({ preferences: newPrefs });
        await get().saveSettings({ preferences: newPrefs });
      },

      setTourStatus: async (tourKey, status) => {
        const prefs = get().preferences;
        if (status === "completed") {
          set({
            preferences: {
              ...prefs,
              completedTours: { ...(prefs.completedTours || {}), [tourKey]: true },
              skippedTours: { ...(prefs.skippedTours || {}), [tourKey]: false },
              dismissedTours: { ...(prefs.dismissedTours || {}), [tourKey]: false },
            },
          });
        } else if (status === "skipped") {
          set({
            preferences: {
              ...prefs,
              completedTours: { ...(prefs.completedTours || {}), [tourKey]: false },
              skippedTours: { ...(prefs.skippedTours || {}), [tourKey]: true },
              dismissedTours: { ...(prefs.dismissedTours || {}), [tourKey]: false },
            },
          });
        } else if (status === "dismissed") {
          set({
            preferences: {
              ...prefs,
              completedTours: { ...(prefs.completedTours || {}), [tourKey]: false },
              skippedTours: { ...(prefs.skippedTours || {}), [tourKey]: false },
              dismissedTours: { ...(prefs.dismissedTours || {}), [tourKey]: true },
            },
          });
        } else {
          // null -> reset all
          set({
            preferences: {
              ...prefs,
              completedTours: { ...(prefs.completedTours || {}), [tourKey]: false },
              skippedTours: { ...(prefs.skippedTours || {}), [tourKey]: false },
              dismissedTours: { ...(prefs.dismissedTours || {}), [tourKey]: false },
            },
          });
        }
        await get().saveSettings({ preferences: get().preferences });
      },

      restartTour: async (tourKey) => {
        await get().setTourStatus(tourKey, null);
      },

      getTourStatus: (tourKey) => {
        const prefs = get().preferences;
        if (prefs.completedTours?.[tourKey]) return "completed";
        if (prefs.skippedTours?.[tourKey]) return "skipped";
        if (prefs.dismissedTours?.[tourKey]) return "dismissed";
        return null;
      },

      saveSettings: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/settings", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("Failed to save settings");
          const result = await res.json();
          if (result.success && result.data) {
            set({
              theme: result.data.theme,
              emailNotifications: result.data.emailNotifications,
              pushNotifications: result.data.pushNotifications,
              defaultLanguage: result.data.defaultLanguage,
              defaultSpeakerIdentification: result.data.defaultSpeakerIdentification,
              defaultTranscriptionMode: result.data.defaultTranscriptionMode,
              preferences: result.data.preferences,
            });
          }
        } catch (error) {
          console.error("Error saving settings:", error);
          set({ error: "Failed to save settings to server" });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: "settings-store" }
  )
);
