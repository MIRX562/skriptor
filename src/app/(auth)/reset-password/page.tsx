import { getDictionary } from "@/i18n/dictionaries";
import { cookies } from "next/headers";
import { ResetPasswordView } from "@/features/reset-password/ui/reset-password-view";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dict = await getDictionary(locale as any);

  return <ResetPasswordView dict={dict} />;
}
