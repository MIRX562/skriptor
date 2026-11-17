"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/features/setting/store/settings-store";
import OnboardingTour from "./onboarding-tour";

type TourKey = "dashboard" | "editor";

function getTourKeyForPathname(pathname: string): TourKey | null {
  if (
    pathname === "/dashboard" ||
    pathname === "/dashboard/transcribe" ||
    pathname === "/dashboard/manage"
  ) {
    return "dashboard";
  }
  if (pathname.startsWith("/dashboard/manage/") && pathname !== "/dashboard/manage") {
    return "editor";
  }
  return null;
}

export function OnboardingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { hasLoaded, getTourStatus } = useSettingsStore();
  const [gateReady, setGateReady] = useState(false);
  const [gatePassed, setGatePassed] = useState(false);

  useEffect(() => {
    if (!hasLoaded) return;
    const tourKey = getTourKeyForPathname(pathname);
    if (!tourKey) {
      setGateReady(true);
      setGatePassed(true);
      return;
    }
    const status = getTourStatus(tourKey);
    if (status === "completed" || status === "skipped") {
      setGateReady(true);
      setGatePassed(true);
    } else {
      setGateReady(true);
      setGatePassed(false);
    }
  }, [pathname, hasLoaded, getTourStatus]);

  if (!gateReady) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-pulse text-muted-foreground">Loading…</span>
        </div>
      </div>
    );
  }

  if (gatePassed) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      <OnboardingTour isMandatory onGatePassed={() => setGatePassed(true)} />
    </div>
  );
}