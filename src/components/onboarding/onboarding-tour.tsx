"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSettingsStore } from "@/features/setting/store/settings-store";

export default function OnboardingTour() {
  const pathname = usePathname();
  const { preferences, hasLoaded, fetchSettings, updatePreference } = useSettingsStore();
  const activeTourRef = useRef<any>(null);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!hasLoaded) return;

    const completedTours = preferences?.completedTours || {};
    const isDashboardTourCompleted = !!completedTours.dashboard;
    const isEditorTourCompleted = !!completedTours.editor;

    // Clean up any active tour on route change
    if (activeTourRef.current) {
      activeTourRef.current.destroy();
      activeTourRef.current = null;
    }

    // Determine current page and run the appropriate tour
    if (
      (pathname === "/dashboard" || 
       pathname === "/dashboard/transcribe" || 
       pathname === "/dashboard/manage") && 
      !isDashboardTourCompleted
    ) {
      // Run Dashboard Tour
      const runDashboardTour = () => {
        // Wait for elements to be present in the DOM
        const checkInterval = setInterval(() => {
          const dropzone = document.getElementById("fileInput");
          const list = document.getElementById("transcriptions-list");
          
          if (dropzone || list) {
            clearInterval(checkInterval);
            
            const steps: any[] = [
              {
                popover: {
                  title: "Welcome to Skriptor! 👋",
                  description: "Let's take a quick 1-minute tour to help you get started with transcribing your audio files.",
                }
              }
            ];

            // If we are on the upload page, highlight the dropzone
            if (document.getElementById("fileInput")) {
              steps.push({
                element: "#fileInput",
                popover: {
                  title: "Upload Audio",
                  description: "Drag and drop your audio files (MP3, WAV, FLAC, M4A) up to 50MB to start the transcription.",
                  side: "bottom",
                  align: "center",
                }
              });
            } else {
              // Otherwise highlight the transcribe tab button
              steps.push({
                element: 'button[value="transcribe"]',
                popover: {
                  title: "Start Transcribing",
                  description: "Click here to upload new audio files and configure transcription language and speaker settings.",
                  side: "bottom",
                  align: "center",
                }
              });
            }

            // Highlight the manage transcriptions tab
            steps.push({
              element: 'button[value="manage"]',
              popover: {
                title: "View & Manage Transcripts",
                description: "Here you can track active transcription progress, open finished transcripts, or delete past records.",
                side: "bottom",
                align: "center",
              }
            });

            const driverObj = driver({
              showProgress: true,
              popoverClass: "skriptor-tour-popover",
              steps: steps,
              onDestroyed: () => {
                // Save completed state to DB
                const currentTours = useSettingsStore.getState().preferences?.completedTours || {};
                updatePreference("completedTours", {
                  ...currentTours,
                  dashboard: true,
                });
              }
            });

            activeTourRef.current = driverObj;
            driverObj.drive();
          }
        }, 500);

        return () => clearInterval(checkInterval);
      };

      runDashboardTour();
    } else if (
      pathname.startsWith("/dashboard/manage/") && 
      pathname !== "/dashboard/manage" && 
      !isEditorTourCompleted
    ) {
      // Run Editor Tour
      const runEditorTour = () => {
        // Wait for asynchronous editor components (waveform, segments list) to mount in the DOM
        const checkInterval = setInterval(() => {
          const waveform = document.getElementById("waveform-player");
          const segments = document.getElementById("segments-container");
          const editBtn = document.getElementById("edit-btn");
          
          if (waveform && segments && editBtn) {
            clearInterval(checkInterval);
            
            const driverObj = driver({
              showProgress: true,
              popoverClass: "skriptor-tour-popover",
              steps: [
                {
                  popover: {
                    title: "Transcription Editor 📝",
                    description: "Welcome to the editor! This is where you play the audio, view segments, make corrections, and export results.",
                  }
                },
                {
                  element: "#waveform-player",
                  popover: {
                    title: "Interactive Waveform Player",
                    description: "Listen to the audio. The waveform matches the active segment in real-time. Click anywhere on the waveform to jump to that moment.",
                    side: "bottom",
                    align: "center",
                  }
                },
                {
                  element: "#edit-btn",
                  popover: {
                    title: "Edit Transcript",
                    description: "Toggle Edit Mode to correct text directly inside segments or assign/edit speaker labels.",
                    side: "bottom",
                    align: "center",
                  }
                },
                {
                  element: "#spellcheck-btn",
                  popover: {
                    title: "Smart Spellchecker",
                    description: "Enable Spellcheck to highlight misspelled words with red squiggly lines. Click on any highlighted word to see instant spelling suggestions.",
                    side: "bottom",
                    align: "center",
                  }
                },
                {
                  element: "#search-btn",
                  popover: {
                    title: "Find & Replace",
                    description: "Quickly search for specific terms or replace occurrences across the entire transcript in bulk.",
                    side: "bottom",
                    align: "center",
                  }
                },
                {
                  element: "#download-btn",
                  popover: {
                    title: "Export & Download",
                    description: "Download your finalized transcription in formats like SRT, VTT, PDF, Word (DOCX), or plain text.",
                    side: "bottom",
                    align: "center",
                  }
                }
              ],
              onDestroyed: () => {
                // Save completed state to DB
                const currentTours = useSettingsStore.getState().preferences?.completedTours || {};
                updatePreference("completedTours", {
                  ...currentTours,
                  editor: true,
                });
              }
            });

            activeTourRef.current = driverObj;
            driverObj.drive();
          }
        }, 500);

        return () => clearInterval(checkInterval);
      };

      runEditorTour();
    }
  }, [pathname, hasLoaded, preferences, updatePreference]);

  return null;
}
