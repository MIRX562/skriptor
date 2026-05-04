"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { SiteHeader } from "./dashboard-header";
import { useProcessPendingJob } from "@/features/transcribe-dashboard/model/use-process-pending-job";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface DashboardTabsProps {
  activeTab: string;
  dict: any;
  locale: string;
  dashboardContent: ReactNode;
  transcribeContent: ReactNode;
  manageContent: ReactNode;
}

export function DashboardTabs({
  activeTab,
  dict,
  locale,
  dashboardContent,
  transcribeContent,
  manageContent,
}: DashboardTabsProps) {
  const router = useRouter();
  const { isProcessingPendingJob } = useProcessPendingJob();

  const handleTabChange = (value: string) => {
    router.push(`/dashboard?tab=${value}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {isProcessingPendingJob && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-teal-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold">{dict.dashboard.processingJob}</h2>
          <p className="text-muted-foreground mt-2">{dict.dashboard.uploadingAudio}</p>
        </div>
      )}
      <SiteHeader dict={dict} locale={locale} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Tabs 
              value={activeTab} 
              onValueChange={handleTabChange} 
              className="w-full"
            >
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger
                    value="dashboard"
                    className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
                  >
                    {dict.tabs.dashboard}
                  </TabsTrigger>
                  <TabsTrigger
                    value="transcribe"
                    className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
                  >
                    {dict.tabs.transcribe}
                  </TabsTrigger>
                  <TabsTrigger
                    value="manage"
                    className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
                  >
                    {dict.tabs.manage}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dashboard" className="space-y-6 mt-6">
                {dashboardContent}
              </TabsContent>

              <TabsContent value="transcribe" className="space-y-6 mt-6">
                {transcribeContent}
              </TabsContent>

              <TabsContent value="manage" className="space-y-6 mt-6">
                {manageContent}
              </TabsContent>
            </Tabs>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
