import AuthLayout from "@/features/auth/ui/auth-layout";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
