import { Suspense } from "react";
import { TranscriptionUpload } from "@/features/transcibe-upload/ui/transcription-upload-view";
import { TranscriptionUploadLoading } from "@/features/transcibe-upload/ui/transcription-upload-loading";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";

export default function TranscribePage() {
  return (
    <Suspense fallback={<TranscriptionUploadLoading />}>
      <TranscribeContent />
    </Suspense>
  );
}

async function TranscribeContent() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return <TranscriptionUpload dict={dict} />;
}
