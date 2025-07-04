"use client";

import { Clock, FileText } from "lucide-react";
import { useDashboardStore } from "../store/dashboard-store";

export function RecentTranscriptions() {
  const { stats, isLoading } = useDashboardStore();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stats.recentTranscriptions.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
            <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium">{item.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.date}</span>
              <span>•</span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{item.duration}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
