// Dashboard store is now UI-only (no data fetching).
// All stats are derived from the useTranscriptionList() TanStack Query hook
// inside the TranscriptionDashboard component.
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface DashboardUIState {
  // reserved for future UI-only state (e.g. selected chart period)
  _placeholder: null;
}

export const useDashboardStore = create<DashboardUIState>()(
  devtools(() => ({ _placeholder: null }), { name: "dashboard-store" })
);
