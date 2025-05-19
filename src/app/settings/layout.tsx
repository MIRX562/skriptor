import { SiteHeader } from "@/features/transcribe-dashboard/ui/dashboard-header";
import { SettingsTabs } from "@/features/setting/ui/setting-tabs";
import type { ReactNode } from "react";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <SiteHeader />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <SettingsTabs>{children}</SettingsTabs>
      </div>
    </div>
  );
}
