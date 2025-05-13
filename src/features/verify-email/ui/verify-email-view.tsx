"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

type VerificationStatus = "checking" | "verified" | "unverified" | "error";

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("checking");
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  // Check verification status when component mounts
  useEffect(() => {
    checkVerificationStatus();
  }, [email]);

  // Handle token verification if present
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  // Countdown for resend button
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Check if the user is already verified
  const checkVerificationStatus = async () => {
    if (!email) return;

    try {
      setVerificationStatus("checking");

      // Call the API to check verification status
      const response = await fetch(
        `/api/auth/verification-status?email=${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error("Failed to check verification status");
      }

      const data = await response.json();

      if (data.isVerified) {
        setVerificationStatus("verified");
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified.",
        });
      } else {
        setVerificationStatus("unverified");
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      setVerificationStatus("error");
      toast({
        title: "Error",
        description: "Failed to check verification status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setVerificationStatus("checking");

      // In a real app, this would be an API call to verify the token
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, let's assume the verification is successful
      setVerificationStatus("verified");
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
    } catch (error) {
      setVerificationStatus("error");
      toast({
        title: "Verification failed",
        description:
          "There was a problem verifying your email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;

    setIsResending(true);

    try {
      // Call the API to resend verification email
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: "User", // In a real app, you would get the user's name
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend verification email");
      }

      toast({
        title: "Verification email sent",
        description: `We've sent a new verification email to ${email}.`,
      });

      // Reset countdown
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Email Verification
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {verificationStatus === "checking"
            ? "Checking verification status..."
            : verificationStatus === "verified"
              ? "Your email has been verified"
              : verificationStatus === "unverified"
                ? `Please verify your email address (${email})`
                : "There was a problem checking your verification status"}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Status Icon */}
        <div className="relative">
          {verificationStatus === "checking" ? (
            <div className="w-20 h-20 rounded-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-teal-600 dark:text-teal-400 animate-spin" />
            </div>
          ) : verificationStatus === "verified" ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </motion.div>
          ) : verificationStatus === "unverified" ? (
            <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-teal-600 dark:text-teal-400" />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center"
            >
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </motion.div>
          )}
        </div>

        {/* Status Message and Actions */}
        <div className="text-center space-y-6 max-w-md">
          {verificationStatus === "checking" ? (
            <p className="text-slate-700 dark:text-slate-300">
              Please wait while we check your verification status...
            </p>
          ) : verificationStatus === "verified" ? (
            <>
              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300">
                  Your email has been successfully verified. You can now access
                  all features of your account.
                </p>
              </div>

              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : verificationStatus === "unverified" ? (
            <>
              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300">
                  We've sent a verification link to your email address. Please
                  check your inbox and click the link to verify your account.
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  If you don't see the email, check your spam folder.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  disabled={isResending || !canResend}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : !canResend ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend email ({countdown}s)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend verification email
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already verified?{" "}
                  <button
                    onClick={checkVerificationStatus}
                    className="text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Check status
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300">
                  There was a problem checking your verification status. Please
                  try again or request a new verification link.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={checkVerificationStatus}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  Try Again
                </Button>

                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send new verification email"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
