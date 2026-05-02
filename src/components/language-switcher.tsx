"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setLocale as setServerLocale } from "@/i18n/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const flags: Record<string, string> = {
  en: "🇺🇸",
  id: "🇮🇩",
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (locale: string) => {
    if (locale === currentLocale) return;
    startTransition(async () => {
      await setServerLocale(locale);
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={isPending}>
          <span className="text-lg leading-none">{flags[currentLocale] || "🇺🇸"}</span>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange("en")} className={currentLocale === "en" ? "bg-slate-100 dark:bg-slate-800" : ""}>
          <span className="mr-2 text-base">🇺🇸</span> English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("id")} className={currentLocale === "id" ? "bg-slate-100 dark:bg-slate-800" : ""}>
          <span className="mr-2 text-base">🇮🇩</span> Bahasa Indonesia
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
