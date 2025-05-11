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
import { motion } from "framer-motion";
import { RecentTranscriptions } from "@/components/recent-transcriptions";
import { TranscriptionStats } from "@/features/dashboard/ui/transcription-stats";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TranscriptionDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transcriptions
              </CardTitle>
              <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Hours Processed
              </CardTitle>
              <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.2</div>
              <p className="text-xs text-muted-foreground">
                +0.8 from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage</CardTitle>
              <Zap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65%</div>
              <div className="mt-2">
                <Progress
                  value={65}
                  className="h-2 bg-slate-200 dark:bg-slate-800"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <Mic className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.3%</div>
              <p className="text-xs text-muted-foreground">
                +0.5% from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Transcriptions</CardTitle>
              <CardDescription>
                Your latest transcription activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px]">
                <RecentTranscriptions />
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Transcription Stats</CardTitle>
              <CardDescription>
                Your transcription usage over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TranscriptionStats />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
