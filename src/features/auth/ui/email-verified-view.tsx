"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface EmailVerifiedViewProps {
  dict: any;
}

export function EmailVerifiedView({ dict }: EmailVerifiedViewProps) {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();
  const verifiedDict = dict.auth.emailVerified;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-teal-500/20 shadow-xl shadow-teal-500/10">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.6, 
              type: "spring", 
              stiffness: 260, 
              damping: 20 
            }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30"
          >
            <CheckCircle2 className="h-12 w-12 text-teal-600 dark:text-teal-400" />
          </motion.div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {verifiedDict.title}
          </CardTitle>
          <CardDescription className="text-lg mt-3 text-slate-600 dark:text-slate-400">
            {verifiedDict.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-1 w-48 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute inset-y-0 left-0 bg-teal-500"
              />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Redirecting in {countdown}s...
            </p>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 transition-all group"
            onClick={() => router.push("/dashboard")}
          >
            {verifiedDict.manualRedirect}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
