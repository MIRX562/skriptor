"use client";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import dynamic from "next/dynamic";

const OnboardingTour = dynamic(
  () => import("@/components/onboarding/onboarding-tour"),
  { ssr: false }
);

type Props = {
  children: React.ReactNode;
};

function QueryProvider({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingTour />
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
