import { LandingPage } from "@/features/landing/ui/landing-view";
import { getLocale } from "@/i18n/locale";
import { getDictionary } from "@/i18n/dictionaries";

export default async function Home() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <LandingPage locale={locale} dict={dict.landing} />;
}
