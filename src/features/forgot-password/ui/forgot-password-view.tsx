"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface ForgotPasswordViewProps {
  dict: any;
}

export function ForgotPasswordView({ dict }: ForgotPasswordViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError(dict.auth.forgotPassword.email.required);
      return;
    }

    if (!validateEmail(email)) {
      setError(dict.auth.forgotPassword.email.invalid);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast.success(dict.auth.forgotPassword.messages.successTitle, {
        description: dict.auth.forgotPassword.messages.successDescription,
      });
    } catch (err: any) {
      console.error("Forget password error:", err);
      toast.error(dict.auth.forgotPassword.messages.errorTitle, {
        description: dict.auth.forgotPassword.messages.errorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {dict.auth.forgotPassword.title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {isSubmitted
            ? dict.auth.forgotPassword.messages.checkEmail
            : dict.auth.forgotPassword.description}
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {dict.auth.forgotPassword.sentTo}
            </p>
            <p className="font-medium">{email}</p>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {dict.auth.forgotPassword.notReceived}
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              {dict.auth.forgotPassword.tryAgain}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{dict.auth.forgotPassword.email.label}</Label>
            <Input
              id="email"
              type="email"
              placeholder={dict.auth.forgotPassword.email.placeholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              className={error ? "border-red-500 dark:border-red-500" : ""}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {dict.auth.forgotPassword.messages.sending}
              </>
            ) : (
              dict.auth.forgotPassword.submit
            )}
          </Button>

          <div className="text-center mt-6">
            <Link
              href="/sign-in"
              className="inline-flex items-center text-sm text-teal-600 dark:text-teal-400 hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {dict.auth.forgotPassword.backToLogin}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
