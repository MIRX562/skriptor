import type { TourKey } from "@/features/setting/store/settings-store";
export type { TourKey };

export interface TourStep {
  /** driver.js element selector (CSS query selector) */
  element: string;
  /** Optional stable data attribute used for more robust targeting */
  dataAttr?: string;
  popover: {
    title: string;
    description: string;
    side?: "top" | "bottom" | "left" | "right";
    align?: "start" | "center" | "end";
  };
}

export interface TourConfig {
  key: TourKey;
  title: string;
  steps: TourStep[];
  /** Routes where this tour is applicable */
  routes: string[];
}

export const DASHBOARD_TOUR: TourConfig = {
  key: "dashboard",
  title: "Welcome to your dashboard",
  routes: ["/dashboard", "/dashboard/transcribe", "/dashboard/manage"],
  steps: [
    {
      element: "[data-tour-step='upload-dropzone']",
      dataAttr: "upload-dropzone",
      popover: {
        title: "Upload your first audio",
        description:
          "Drag & drop MP3/WAV/FLAC/M4A (up to 50MB) onto the dropzone, then start transcription.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour-step="transcribe-tab"]',
      dataAttr: "transcribe-tab",
      popover: {
        title: "Go to Transcribe",
        description:
          "Open the Transcribe tab to upload audio and configure transcription options.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: '[data-tour-step="manage-tab"]',
      dataAttr: "manage-tab",
      popover: {
        title: "Track & open results",
        description:
          "Use Manage to monitor progress and open completed transcripts.",
        side: "bottom",
        align: "center",
      },
    },
  ],
};

export const EDITOR_TOUR: TourConfig = {
  key: "editor",
  title: "Explore the transcript editor",
  routes: ["/dashboard/manage/"],
  steps: [
    {
      element: "[data-tour-step='waveform-player']",
      dataAttr: "waveform-player",
      popover: {
        title: "Play and review audio",
        description:
          "Use waveform playback to review transcript timing and content.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "[data-tour-step='edit-btn']",
      dataAttr: "edit-btn",
      popover: {
        title: "Edit transcript",
        description:
          "Switch to edit mode to correct text and speaker labels.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "[data-tour-step='download-btn']",
      dataAttr: "download-btn",
      popover: {
        title: "Export final result",
        description:
          "Download as SRT, VTT, PDF, DOCX, or TXT when finished.",
        side: "bottom",
        align: "center",
      },
    },
  ],
};

export const TOUR_CONFIGS: Record<TourKey, TourConfig> = {
  dashboard: DASHBOARD_TOUR,
  editor: EDITOR_TOUR,
};