import { LandingPage } from "@/features/landing/ui/landing-view";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function Home() {
  // We fetch dictionary and locale here, but we can wrap the rendering in Suspense
  // to allow the layout shell to render immediately.
  return (
    <Suspense fallback={<LandingLoading />}>
      <LandingContent />
    </Suspense>
  );
}

async function LandingContent() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <LandingPage locale={locale} dict={dict} />;
}

function LandingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <Loader2 className="h-12 w-12 text-teal-600 animate-spin" />
    </div>
  );
}
