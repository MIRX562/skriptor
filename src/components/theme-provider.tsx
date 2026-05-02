"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

// next-themes injects an inline <script> to prevent FOUC during SSR.
// React 19 warns about script tags inside components, but this is a false
// positive — the script only runs server-side, never on the client.
// Suppress until next-themes ships a React 19-compatible release.
if (typeof window !== "undefined") {
  const orig = console.error.bind(console);
  // eslint-disable-next-line no-console
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    orig(...args);
  };
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
