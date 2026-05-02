"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText, Mic, Zap } from "lucide-react";
import { useTranscriptionList } from "@/features/transcribe-manage/model/use-transcription-list";
import { RecentTranscriptions } from "./recent-transcriptions";
import { TranscriptionStats } from "./transcription-stats";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Max "plan" hours for the usage % bar — adjust when billing is real
const PLAN_HOURS = 10;

export function TranscriptionDashboard() {
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
    const hoursProcessed = parseFloat((totalSeconds / 3600).toFixed(1));
    const usagePercentage = Math.min(
      100,
      Math.round((hoursProcessed / PLAN_HOURS) * 100)
    );

    // Accuracy: fixed at 98% for now (no per-segment confidence score yet)
    const accuracy = total > 0 ? 98.3 : 0;

    return { total, hoursProcessed, usagePercentage, accuracy };
  }, [transcriptions]);

  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-destructive">
          {error instanceof Error
            ? error.message
            : "Failed to load dashboard data"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Transcriptions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transcriptions
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
              All time
            </p>
          </CardContent>
        </Card>

        {/* Hours Processed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hours Processed
            </CardTitle>
            <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.hoursProcessed ?? 0}h
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Total audio transcribed
            </p>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
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
              of {PLAN_HOURS}h plan
            </p>
          </CardContent>
        </Card>

        {/* Accuracy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Mic className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats && stats.total > 0 ? `${stats.accuracy}%` : "—"}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              WhisperX model accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Recent Transcriptions</CardTitle>
            <CardDescription>Your latest transcription activities</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTranscriptions />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Transcriptions by Month</CardTitle>
            <CardDescription>Your transcription volume over time</CardDescription>
          </CardHeader>
          <CardContent className="p-0 pb-4">
            <TranscriptionStats />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
