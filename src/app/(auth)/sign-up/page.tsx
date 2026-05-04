import SignupPage from "@/features/sign-up/ui/signup-view";
import { getDictionary } from "@/i18n/dictionaries";
import { cookies } from "next/headers";
import React from "react";

export default async function Signup() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const dict = await getDictionary(locale);

  return <SignupPage dict={dict} />;
}
