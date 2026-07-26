"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSettingsStore } from "@/features/setting/store/settings-store";

const POLL_INTERVAL_MS = 250;
const MAX_WAIT_MS = 8000;

export default function OnboardingTour() {
  const pathname = usePathname();
  const { preferences, hasLoaded, fetchSettings, updatePreference } =
    useSettingsStore();
  const activeTourRef = useRef<any>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!hasLoaded) return;

    const completedTours = preferences?.completedTours || {};
    const isDashboardTourCompleted = !!completedTours.dashboard;
    const isEditorTourCompleted = !!completedTours.editor;

    if (activeTourRef.current) {
      activeTourRef.current.destroy();
      activeTourRef.current = null;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearTimers = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const markTourCompleted = (tourKey: "dashboard" | "editor") => {
      const currentTours =
        useSettingsStore.getState().preferences?.completedTours || {};
      updatePreference("completedTours", {
        ...currentTours,
        [tourKey]: true,
      });
    };

    const startTour = (steps: any[], tourKey: "dashboard" | "editor") => {
      if (steps.length === 0) return;

      const driverObj = driver({
        showProgress: steps.length > 1,
        popoverClass: "skriptor-tour-popover",
        steps,
        onDestroyed: () => {
          markTourCompleted(tourKey);
        },
      });

      activeTourRef.current = driverObj;
      driverObj.drive();
    };

    const isDashboardRoute =
      pathname === "/dashboard" ||
      pathname === "/dashboard/transcribe" ||
      pathname === "/dashboard/manage";

    const isEditorRoute =
      pathname.startsWith("/dashboard/manage/") &&
      pathname !== "/dashboard/manage";

    if (isDashboardRoute && !isDashboardTourCompleted) {
      intervalId = setInterval(() => {
        const dropzone = document.getElementById("fileInput");
        const transcribeTab = document.querySelector(
          'button[value="transcribe"]',
        );
        const manageTab = document.querySelector('button[value="manage"]');

        if (!dropzone && !transcribeTab && !manageTab) return;

        clearTimers();

        const steps: any[] = [];

        if (dropzone) {
          steps.push({
            element: "#fileInput",
            popover: {
              title: "Upload your first audio",
              description:
                "Drag & drop MP3/WAV/FLAC/M4A (up to 50MB), then start transcription.",
              side: "bottom",
              align: "center",
            },
          });
        } else if (transcribeTab) {
          steps.push({
            element: 'button[value="transcribe"]',
            popover: {
              title: "Go to Transcribe",
              description:
                "Open this tab to upload audio and configure transcription options.",
              side: "bottom",
              align: "center",
            },
          });
        }

        if (manageTab) {
          steps.push({
            element: 'button[value="manage"]',
            popover: {
              title: "Track & open results",
              description:
                "Use Manage to monitor progress and open completed transcripts.",
              side: "bottom",
              align: "center",
            },
          });
        }

        startTour(steps, "dashboard");
      }, POLL_INTERVAL_MS);

      timeoutId = setTimeout(() => {
        clearTimers();
      }, MAX_WAIT_MS);
    } else if (isEditorRoute && !isEditorTourCompleted) {
      intervalId = setInterval(() => {
        const waveform = document.getElementById("waveform-player");
        const editBtn = document.getElementById("edit-btn");
        const downloadBtn = document.getElementById("download-btn");

        if (!waveform || !editBtn || !downloadBtn) return;

        clearTimers();

        startTour(
          [
            {
              element: "#waveform-player",
              popover: {
                title: "Play and review audio",
                description:
                  "Use waveform playback to review transcript timing and content.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "#edit-btn",
              popover: {
                title: "Edit transcript",
                description:
                  "Switch to edit mode to correct text and speaker labels.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "#download-btn",
              popover: {
                title: "Export final result",
                description:
                  "Download as SRT, VTT, PDF, DOCX, or TXT when finished.",
                side: "bottom",
                align: "center",
              },
            },
          ],
          "editor",
        );
      }, POLL_INTERVAL_MS);

      timeoutId = setTimeout(() => {
        clearTimers();
      }, MAX_WAIT_MS);
    }

    return () => {
      clearTimers();
      if (activeTourRef.current) {
        activeTourRef.current.destroy();
        activeTourRef.current = null;
      }
    };
  }, [pathname, hasLoaded, preferences, updatePreference]);

  return null;
}
