"use client";

import { Mail, ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";

import { useSearchParams } from "next/navigation";

interface VerifyEmailViewProps {
  dict: any;
}

export function VerifyEmailView({ dict }: VerifyEmailViewProps) {
  const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const verifyDict = dict.auth.verifyEmail;

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address not found. Please try logging in.");
      return;
    }

    setIsResending(true);
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: window.location.origin + "/email-verified",
      });
      toast.success(dict.auth.forgotPassword.messages.success);
    } catch (error) {
      console.error("Resend error:", error);
      toast.error(dict.auth.signUp.messages.error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-teal-500/20 shadow-lg shadow-teal-500/5">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/20"
          >
            <Mail className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </motion.div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {verifyDict.title}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {verifyDict.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center italic">
              {verifyDict.spamHint}
            </p>
          </div>
          
          <Button
            variant="outline"
            className="w-full gap-2 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
            onClick={handleResend}
            disabled={isResending}
          >
            <RefreshCcw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
            {verifyDict.resend}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="text-center w-full">
            <Link 
              href="/sign-in" 
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {verifyDict.backToLogin}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
