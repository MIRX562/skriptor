import AuthLayout from "@/features/auth/ui/auth-layout";
import { getLocale } from "@/i18n/locale";
import React, { Suspense } from "react";

export default async function layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AuthLayoutShell>{children}</AuthLayoutShell>}>
      <AuthContent>{children}</AuthContent>
    </Suspense>
  );
}

async function AuthContent({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return <AuthLayout locale={locale}>{children}</AuthLayout>;
}

function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  return <AuthLayout locale="en">{children}</AuthLayout>;
}
