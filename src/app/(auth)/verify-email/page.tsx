import { VerifyEmailView } from "@/features/auth/ui/verify-email-view";
import { getDictionary } from "@/i18n/dictionaries";
import { cookies } from "next/headers";
import React from "react";

export default async function page() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dict = await getDictionary(locale);

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailView dict={dict} />
    </React.Suspense>
  );
}
