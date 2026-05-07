"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "framer-motion";
import Logo from "@/components/logo";
import DashboardUserMenu from "./dashboard-header-user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { DashboardNav } from "./dashboard-nav";

export function SiteHeader({ dict, locale }: { dict?: any; locale?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`relative z-10 transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-slate-950 shadow-sm"
          : "bg-white dark:bg-slate-950"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Logo />
            </motion.div>
            <span className="font-medium text-lg">Skriptor</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center justify-center flex-1 mx-4">
          <DashboardNav dict={dict} className="max-w-md" />
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-3">
            <LanguageSwitcher currentLocale={locale || "en"} />
            <ModeToggle />
          </div>
          <DashboardUserMenu dict={dict} />
          
        </div>
      </div>
    </header>
  );
}
