"use client";

import { Suspense, useState } from "react";
import { TranscriptionDashboard } from "@/features/transcribe-dashboard/ui/transcription-dashboard";
import { TranscriptionList } from "@/features/transcribe-manage/ui/transcription-list";
import { TranscriptionView } from "@/features/transcribe-manage/ui/transcription-view";
import { SiteHeader } from "@/features/transcribe-dashboard/ui/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import DashboardLoading from "@/app/dashboard/loading";
import { TranscriptionViewLoading } from "@/features/transcribe-manage/ui/transcription-view-loading";
import { TranscriptionListLoading } from "@/features/transcribe-manage/ui/transcription-list-loading";
import { TranscriptionUploadLoading } from "@/features/transcibe-upload/ui/transcription-upload-loading";
import { TranscriptionUpload } from "@/features/transcibe-upload/ui/transcription-upload";

export function DashboardPage() {
  const [selectedView, setSelectedView] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <SiteHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Tabs defaultValue="transcribe" orientation="vertical">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger
                    value="dashboard"
                    className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
                  >
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="transcribe"
                    className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
                  >
                    Transcribe
                  </TabsTrigger>
                  <TabsTrigger
                    value="manage"
                    className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
                  >
                    Manage
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dashboard" className="space-y-6 mt-6">
                <Suspense fallback={<DashboardLoading />}>
                  <TranscriptionDashboard />
                </Suspense>
              </TabsContent>

              <TabsContent value="transcribe" className="space-y-6 mt-6">
                <Suspense fallback={<TranscriptionUploadLoading />}>
                  <TranscriptionUpload />
                </Suspense>
              </TabsContent>

              <TabsContent value="manage" className="space-y-6 mt-6">
                {selectedView ? (
                  <Suspense fallback={<TranscriptionViewLoading />}>
                    <TranscriptionView
                      id={selectedView}
                      onBack={() => setSelectedView(null)}
                    />
                  </Suspense>
                ) : (
                  <Suspense fallback={<TranscriptionListLoading />}>
                    <TranscriptionList onSelect={(id) => setSelectedView(id)} />
                  </Suspense>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
