import { Suspense } from "react";
import { TranscriptionView } from "@/features/transcribe-manage/ui/transcription-view";
import { TranscriptionViewLoading } from "@/features/transcribe-manage/ui/transcription-view-loading";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";

export default async function TranscriptionDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <Suspense fallback={<TranscriptionViewLoading />}>
      <DetailContent id={id} />
    </Suspense>
  );
}

async function DetailContent({ id }: { id: string }) {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return <TranscriptionView id={id} dict={dict} />;
}
