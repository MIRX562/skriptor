"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, PenTool, ListMusic } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  dict: any;
  className?: string;
}

export function DashboardNav({ dict, className }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname.startsWith("/dashboard/transcribe")
    ? "transcribe"
    : pathname.startsWith("/dashboard/manage")
    ? "manage"
    : "dashboard";

  const handleTabChange = (value: string) => {
    if (value === "dashboard") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard/${value}`);
    }
  };

  const tabsDict = {
    dashboard: dict?.tabs?.dashboard || "Dashboard",
    transcribe: dict?.tabs?.transcribe || "Transcribe",
    manage: dict?.tabs?.manage || "Manage",
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={handleTabChange} 
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <TabsTrigger 
          value="dashboard" 
          className="text-xs font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-sm"
        >
          <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
          {tabsDict.dashboard}
        </TabsTrigger>
        <TabsTrigger 
          value="transcribe" 
          className="text-xs font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-sm"
        >
          <PenTool className="h-3.5 w-3.5 mr-1.5" />
          {tabsDict.transcribe}
        </TabsTrigger>
        <TabsTrigger 
          value="manage" 
          className="text-xs font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-sm"
        >
          <ListMusic className="h-3.5 w-3.5 mr-1.5" />
          {tabsDict.manage}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
