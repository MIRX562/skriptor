import { SettingsTabs } from "@/features/setting/ui/setting-tabs";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsHeader } from "./_components/settings-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Suspense fallback={<HeaderSkeleton />}>
        <SettingsHeaderWrapper />
      </Suspense>
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={<SettingsSkeleton />}>
          <AuthWrapper>{children}</AuthWrapper>
        </Suspense>
      </main>
    </div>
  );
}

async function SettingsHeaderWrapper() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <SettingsHeader dict={dict} locale={locale} />;
}

async function AuthWrapper({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <SettingsTabs>{children}</SettingsTabs>;
}

function HeaderSkeleton() {
  return <div className="h-16 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 animate-pulse" />;
}

function SettingsSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex-1 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
