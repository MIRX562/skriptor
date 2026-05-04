import { Suspense } from "react";
import { TranscriptionList } from "@/features/transcribe-manage/ui/transcription-list";
import { TranscriptionListLoading } from "@/features/transcribe-manage/ui/transcription-list-loading";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";

export default function ManagePage() {
  return (
    <Suspense fallback={<TranscriptionListLoading />}>
      <ManageContent />
    </Suspense>
  );
}

async function ManageContent() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return <TranscriptionList dict={dict} />;
}
