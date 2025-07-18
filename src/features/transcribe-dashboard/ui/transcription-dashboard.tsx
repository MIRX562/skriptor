"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText, Mic, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStore } from "../store/dashboard-store";
import { RecentTranscriptions } from "./recent-transcriptions";
import { TranscriptionStats } from "./transcription-stats";

export function TranscriptionDashboard() {
  const { stats, isLoading, error, fetchDashboardData } = useDashboardStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData().catch((err) => {
      console.error("Error fetching dashboard data:", err);
    });
  }, [fetchDashboardData]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transcriptions
            </CardTitle>
            <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalTranscriptions}
            </div>
            <p className="text-xs text-muted-foreground">+2 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hours Processed
            </CardTitle>
            <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.hoursProcessed}
            </div>
            <p className="text-xs text-muted-foreground">+0.8 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <Zap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `${stats.usagePercentage}%`}
            </div>
            <div className="mt-2">
              <Progress
                value={isLoading ? 0 : stats.usagePercentage}
                className="h-2 bg-slate-200 dark:bg-slate-800"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Mic className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `${stats.accuracy}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Recent Transcriptions</CardTitle>
            <CardDescription>
              Your latest transcription activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTranscriptions />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Transcription Stats</CardTitle>
            <CardDescription>
              Your transcription usage over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TranscriptionStats />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
