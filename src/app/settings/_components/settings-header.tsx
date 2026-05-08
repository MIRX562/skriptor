"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import Logo from "@/components/logo";
import DashboardUserMenu from "@/features/transcribe-dashboard/ui/dashboard-header-user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ChevronLeft, Settings } from "lucide-react";

interface SettingsHeaderProps {
  dict?: any;
  locale?: string;
}

export function SettingsHeader({ dict, locale }: SettingsHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 shrink-0">
          <Link href="/dashboard" className="group flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium hidden lg:inline-block">Back</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100/50 dark:border-teal-900/20">
            <Settings className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-semibold text-teal-900 dark:text-teal-100">Settings</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-3">
            <LanguageSwitcher currentLocale={locale || "en"} />
            <ModeToggle />
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <DashboardUserMenu dict={dict} />
        </div>
      </div>
    </header>
  );
}
