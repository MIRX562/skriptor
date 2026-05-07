"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { useTranscriptionList } from "@/features/transcribe-manage/model/use-transcription-list";
import { RecentTranscriptions } from "./recent-transcriptions";
import { TranscriptionStats } from "./transcription-stats";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Max "plan" hours for the usage % bar — adjust when billing is real
const PLAN_HOURS = 10;

export function TranscriptionDashboard({ dict }: { dict: any }) {
  const { data: transcriptions, isLoading, error } = useTranscriptionList();

  const stats = useMemo(() => {
    if (!transcriptions) return null;

    const total = transcriptions.length;

    // Sum duration from metadata
    const totalSeconds = transcriptions.reduce((sum, t) => {
      const dur =
        (t.metadata as { durationSeconds?: number } | null)?.durationSeconds ??
        0;
      return sum + dur;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const hoursProcessed = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    const usagePercentage = Math.min(
      100,
      Math.round(((totalSeconds / 3600) / PLAN_HOURS) * 100)
    );

    // Accuracy: fixed at 98% for now (no per-segment confidence score yet)
    const accuracy = total > 0 ? 98.3 : 0;

    return { total, hoursProcessed, usagePercentage, accuracy };
  }, [transcriptions]);

  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">{dict.dashboard.title}</h2>
        <p className="text-destructive">
          {error instanceof Error
            ? error.message
            : dict.dashboard.errors.loadFailed}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-0 md:px-4 space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight px-4 md:px-0">{dict.dashboard.title}</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Transcriptions */}
        <Card className="md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50 md:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.dashboard.stats.totalTranscriptions}
            </CardTitle>
            <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {dict.dashboard.stats.allTime}
            </p>
          </CardContent>
        </Card>

        {/* Hours Processed */}
        <Card className="md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50 md:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.dashboard.stats.hoursProcessed}
            </CardTitle>
            <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.hoursProcessed ?? "00:00:00"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {dict.dashboard.stats.totalAudio}
            </p>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card className="md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50 md:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dict.dashboard.stats.usage}</CardTitle>
            <Zap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.usagePercentage ?? 0}%
              </div>
            )}
            <div className="mt-2">
              <Progress
                value={isLoading ? 0 : (stats?.usagePercentage ?? 0)}
                className="h-2 bg-slate-200 dark:bg-slate-800"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {dict.dashboard.stats.ofPlan.replace("{planHours}", PLAN_HOURS.toString())}
            </p>
          </CardContent>
        </Card>

        <Link 
          href="/dashboard/transcribe"
          className="group"
        >
          <Card className="h-full bg-teal-600 dark:bg-teal-500 border-none shadow-lg hover:bg-teal-700 dark:hover:bg-teal-400 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-500">
              <Plus className="h-24 w-24 text-white" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-50">
                {dict.dashboard.actions.newTranscription}
              </CardTitle>
              <Plus className="h-4 w-4 text-white group-hover:rotate-90 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {dict.dashboard.actions.startNow}
              </div>
              <p className="text-xs text-teal-100/80 mt-1">
                {dict.dashboard.actions.uploadOrRecord}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1 md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50 md:bg-card">
          <CardHeader>
            <CardTitle>{dict.dashboard.recentTranscriptions.title}</CardTitle>
            <CardDescription>{dict.dashboard.recentTranscriptions.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTranscriptions dict={dict} />
          </CardContent>
        </Card>

        <Card className="flex-1 md:border-slate-200 md:dark:border-slate-800 md:shadow-md md:rounded-xl rounded-none border-0 shadow-none bg-slate-50/50 dark:bg-slate-900/50 md:bg-card">
          <CardHeader>
            <CardTitle>{dict.dashboard.monthlyStats.title}</CardTitle>
            <CardDescription>{dict.dashboard.monthlyStats.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-4">
            <TranscriptionStats dict={dict} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
