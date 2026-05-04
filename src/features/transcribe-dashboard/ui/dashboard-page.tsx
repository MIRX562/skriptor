import { Suspense } from "react";
import { TranscriptionDashboard } from "@/features/transcribe-dashboard/ui/transcription-dashboard";
import { TranscriptionList } from "@/features/transcribe-manage/ui/transcription-list";
import { TranscriptionView } from "@/features/transcribe-manage/ui/transcription-view";
import { DashboardSkeleton } from "@/features/transcribe-dashboard/ui/dashboard-skeleton";
import { TranscriptionUploadLoading } from "@/features/transcibe-upload/ui/transcription-upload-loading";
import { TranscriptionUpload } from "@/features/transcibe-upload/ui/transcription-upload-view";
import { TranscriptionListLoading } from "@/features/transcribe-manage/ui/transcription-list-loading";
import { TranscriptionViewLoading } from "@/features/transcribe-manage/ui/transcription-view-loading";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";
import { DashboardTabs } from "./dashboard-tabs";

export async function DashboardPage({ 
  activeTab: initialTab, 
  selectedViewId 
}: { 
  activeTab?: string; 
  selectedViewId?: string | null;
}) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  
  const activeTab = initialTab || "transcribe";

  return (
    <DashboardTabs
      activeTab={activeTab}
      dict={dict}
      locale={locale}
      dashboardContent={
        <Suspense fallback={<DashboardSkeleton />}>
          <TranscriptionDashboard dict={dict} />
        </Suspense>
      }
      transcribeContent={
        <Suspense fallback={<TranscriptionUploadLoading />}>
          <TranscriptionUpload dict={dict} />
        </Suspense>
      }
      manageContent={
        <Suspense fallback={selectedViewId ? <TranscriptionViewLoading /> : <TranscriptionListLoading />}>
          <ManageTabContent selectedViewId={selectedViewId} dict={dict} />
        </Suspense>
      }
    />
  );
}

// Helper component to handle the conditional view vs list in the manage tab
function ManageTabContent({ selectedViewId, dict }: { selectedViewId?: string | null; dict: any }) {
  if (selectedViewId) {
    return <TranscriptionView id={selectedViewId} dict={dict} />;
  }
  return <TranscriptionList dict={dict} />;
}
