import { Suspense } from "react";
import { redirect } from "next/navigation";
import { TranscriptionDashboard } from "@/features/transcribe-dashboard/ui/transcription-dashboard";
import { DashboardSkeleton } from "@/features/transcribe-dashboard/ui/dashboard-skeleton";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string }>;
}) {
  const { tab, view } = await searchParams;

  // Handle legacy redirects
  if (view) {
    redirect(`/dashboard/manage/${view}`);
  }

  if (tab === "transcribe") {
    redirect("/dashboard/transcribe");
  }

  if (tab === "manage") {
    redirect("/dashboard/manage");
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return <TranscriptionDashboard dict={dict} />;
}
