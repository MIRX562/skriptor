"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSettingsStore } from "@/features/setting/store/settings-store";
import {
  TOUR_CONFIGS,
  TourConfig,
  TourStep,
  type TourKey,
} from "./tour-steps";

const POLL_INTERVAL_MS = 250;
const MAX_WAIT_MS = 8000;

interface OnboardingTourProps {
  isMandatory?: boolean;
  onGatePassed?: () => void;
}

export default function OnboardingTour({
  isMandatory = false,
  onGatePassed,
}: OnboardingTourProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    hasLoaded,
    fetchSettings,
    setTourStatus,
    getTourStatus,
  } = useSettingsStore();

  const activeTourRef = useRef<ReturnType<typeof driver> | null>(null);
  const tourStateRef = useRef<"idle" | "polling" | "active" | "fallback">(
    "idle"
  );
  const currentTourRef = useRef<TourKey | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const startDriverTour = useCallback(
    (config: TourConfig) => {
      const driverObj = driver({
        showProgress: config.steps.length > 1,
        popoverClass: "skriptor-tour-popover",
        allowClose: false,
        showButtons: ["next"] as const,
        steps: config.steps.map((step) => ({
          element: step.element,
          popover: {
            className: "skriptor-tour-popover",
            title: step.popover.title,
            description: step.popover.description,
            side: step.popover.side,
            align: step.popover.align,
          },
        })),
        onDestroyed: () => {
          activeTourRef.current = null;
          tourStateRef.current = "idle";
          const tourKey = currentTourRef.current;
          if (tourKey) {
            setTourStatus(tourKey, "completed");
          }
          if (onGatePassed) onGatePassed();
        },
      });

      activeTourRef.current = driverObj;
      driverObj.drive();
    },
    [setTourStatus, onGatePassed]
  );

  useEffect(() => {
    if (!hasLoaded) return;

    const tourKey: TourKey | null =
      pathname === "/dashboard" ||
      pathname === "/dashboard/transcribe" ||
      pathname === "/dashboard/manage"
        ? "dashboard"
        : pathname.startsWith("/dashboard/manage/") &&
          pathname !== "/dashboard/manage"
        ? "editor"
        : null;

    if (!tourKey) {
      if (
        tourStateRef.current === "active" &&
        activeTourRef.current
      ) {
        activeTourRef.current.destroy();
        activeTourRef.current = null;
        tourStateRef.current = "idle";
      }
      return;
    }

    const status = getTourStatus(tourKey);

    if (status === "completed" || status === "skipped") {
      if (
        tourStateRef.current === "active" &&
        activeTourRef.current
      ) {
        activeTourRef.current.destroy();
        activeTourRef.current = null;
        tourStateRef.current = "idle";
      }
      return;
    }

    const config = TOUR_CONFIGS[tourKey];
    currentTourRef.current = tourKey;

    if (status !== null && status !== "dismissed") return;

    tourStateRef.current = "polling";

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

    const startDriver = () => {
      clearTimers();
      tourStateRef.current = "active";
      startDriverTour(config);
    };

    const pollForElements = () => {
      const allPresent = config.steps.every((step: TourStep) => {
        if (step.dataAttr) {
          return (
            document.querySelector(
              `[data-tour-step="${step.dataAttr}"]`
            ) !== null
          );
        }
        return document.querySelector(step.element) !== null;
      });

      if (!allPresent) return;
      startDriver();
    };

    intervalId = setInterval(pollForElements, POLL_INTERVAL_MS);

    timeoutId = setTimeout(() => {
      clearTimers();
      if (tourStateRef.current === "polling") {
        tourStateRef.current = "fallback";
      }
    }, MAX_WAIT_MS);

    return () => {
      clearTimers();
      if (activeTourRef.current) {
        activeTourRef.current.destroy();
        activeTourRef.current = null;
      }
      tourStateRef.current = "idle";
    };
  }, [pathname, hasLoaded, getTourStatus, startDriverTour]);

  return null;
}
