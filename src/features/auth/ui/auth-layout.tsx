"use client";
import type React from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 md:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                src="/logo.png"
                alt="logo"
                width={40}
                height={40}
                className="dark:bg-teal-400 bg-teal-500 rounded-md"
              />
            </motion.div>
            <span className="font-medium text-lg">Skriptor</span>
          </Link>
          <ModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            {children}
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Need help?{" "}
              <Link
                href="/contact"
                className="text-teal-600 dark:text-teal-400 hover:underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 md:px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-center items-center text-center md:text-left space-y-2 md:space-y-0 md:space-x-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2023 Skriptor. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link
              href="/terms"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
