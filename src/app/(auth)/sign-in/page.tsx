import SignInPage from "@/features/sign-in/ui/sign-in-view";
import { getDictionary } from "@/i18n/dictionaries";
import { cookies } from "next/headers";
import React from "react";

export default async function page() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dict = await getDictionary(locale);

  return <SignInPage dict={dict} />;
}
