import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface NotificationSettings {
  email: {
    transcriptionComplete: boolean;
    weeklyDigest: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
  };
  push: {
    transcriptionComplete: boolean;
    weeklyDigest: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
  };
}

interface SettingsState {
  notifications: NotificationSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  updateNotificationSetting: (
    category: "email" | "push",
    setting: string,
    value: boolean
  ) => void;
  saveNotificationSettings: () => Promise<void>;
  resetNotificationSettings: () => void;
}

const defaultNotifications: NotificationSettings = {
  email: {
    transcriptionComplete: true,
    weeklyDigest: true,
    productUpdates: true,
    securityAlerts: true,
  },
  push: {
    transcriptionComplete: true,
    weeklyDigest: false,
    productUpdates: false,
    securityAlerts: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        notifications: defaultNotifications,
        isLoading: false,
        error: null,

        updateNotificationSetting: (category, setting, value) => {
          set((state) => ({
            notifications: {
              ...state.notifications,
              [category]: {
                ...state.notifications[category],
                [setting]: value,
              },
            },
          }));
        },

        saveNotificationSettings: async () => {
          set({ isLoading: true, error: null });

          try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            set({ isLoading: false });
          } catch (error) {
            set({
              error:
                "Failed to update notification settings. Please try again.",
              isLoading: false,
            });
            throw error;
          }
        },

        resetNotificationSettings: () => {
          set({ notifications: defaultNotifications });
        },
      }),
      {
        name: "settings-storage",
        partialize: (state) => ({
          notifications: state.notifications,
        }),
      }
    )
  )
);
