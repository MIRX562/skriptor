"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Menu, SquareArrowOutUpRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSwitcher } from "@/components/language-switcher";
import Logo from "@/components/logo";
import { authClient } from "@/lib/auth-client";

export function LandingHeader({ locale, dict }: { locale: string; dict: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const headerDict = dict?.landing?.header || {};

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
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

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            {headerDict.features}
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            {headerDict.pricing}
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            {headerDict.testimonials}
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            {headerDict.faq}
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-center">
                  {headerDict.dashboard}
                  <SquareArrowOutUpRight />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="outline" className="w-full justify-center">
                    {headerDict.login}
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="w-full justify-center bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700">
                    {headerDict.signup}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <LanguageSwitcher currentLocale={locale} />
          <ModeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
              <Link
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {headerDict.features}
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {headerDict.pricing}
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {headerDict.testimonials}
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {headerDict.faq}
              </Link>
              <div className="pt-2 flex flex-col space-y-2">
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-center">
                      {headerDict.dashboard}
                      <SquareArrowOutUpRight />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-in">
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                      >
                        {headerDict.login}
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button className="w-full justify-center bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700">
                        {headerDict.signup}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
