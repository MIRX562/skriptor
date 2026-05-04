import { Suspense } from "react";
import { DashboardPage } from "@/features/transcribe-dashboard/ui/dashboard-page";
import { DashboardSkeleton } from "@/features/transcribe-dashboard/ui/dashboard-skeleton";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string }>;
}) {
  const { tab, view } = await searchParams;

  return (
    <DashboardPage activeTab={tab} selectedViewId={view} />
  );
}
