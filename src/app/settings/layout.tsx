import { SiteHeader } from "@/features/transcribe-dashboard/ui/dashboard-header";
import { SettingsTabs } from "@/features/setting/ui/setting-tabs";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Suspense fallback={<HeaderSkeleton />}>
        <SiteHeaderWrapper />
      </Suspense>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <SettingsTabs>{children}</SettingsTabs>
      </div>
    </div>
  );
}

async function SiteHeaderWrapper() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <SiteHeader dict={dict} locale={locale} />;
}

function HeaderSkeleton() {
  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-border/50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
        <div className="flex space-x-4">
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
          <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-full" />
        </div>
      </div>
    </header>
  );
}
