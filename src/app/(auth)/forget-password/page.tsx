import { getDictionary } from "@/i18n/dictionaries";
import { cookies } from "next/headers";
import { ForgotPasswordView } from "@/features/forgot-password/ui/forgot-password-view";

export default async function ForgotPasswordPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dict = await getDictionary(locale as any);

  return <ForgotPasswordView dict={dict} />;
}
