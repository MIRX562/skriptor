"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
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
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);

    // Simulate API call
    try {
      // In a real app, this would be an API call to your password reset endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSubmitted(true);
      toast.success("Reset link sent", {
        description: "Check your email for a link to reset your password.",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          "There was a problem sending the reset link. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Reset your password
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {isSubmitted
            ? "Check your email for a reset link"
            : "Enter your email and we'll send you a link to reset your password"}
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We've sent a password reset link to:
            </p>
            <p className="font-medium">{email}</p>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Didn't receive the email? Check your spam folder or try again.
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Try again
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
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
                Sending reset link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <div className="text-center mt-6">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-teal-600 dark:text-teal-400 hover:underline"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
