import { Suspense } from "react";
import { DashboardTabs } from "@/features/transcribe-dashboard/ui/dashboard-tabs";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}>
      <OnboardingGate>
        <DashboardContent>{children}</DashboardContent>
      </OnboardingGate>
    </Suspense>
  );
}

async function DashboardContent({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return (
    <DashboardTabs dict={dict} locale={locale}>
      {children}
    </DashboardTabs>
  );
}
