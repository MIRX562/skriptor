"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranscriptionList } from "@/features/transcribe-manage/model/use-transcription-list";
import { Skeleton } from "@/components/ui/skeleton";

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function TranscriptionStats() {
  const { data: transcriptions, isLoading } = useTranscriptionList();

  const chartData = useMemo(() => {
    if (!transcriptions || transcriptions.length === 0) return [];

    // Count transcriptions per month, last 7 calendar months
    const now = new Date();
    const months: { month: string; count: number; year: number; monthIndex: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: SHORT_MONTHS[d.getMonth()],
        count: 0,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    transcriptions.forEach((t) => {
      if (!t.createdAt) return;
      const d = new Date(t.createdAt);
      const entry = months.find(
        (m) => m.monthIndex === d.getMonth() && m.year === d.getFullYear()
      );
      if (entry) entry.count++;
    });

    return months.map(({ month, count }) => ({ month, count }));
  }, [transcriptions]);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center px-4">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (chartData.length === 0 || chartData.every((d) => d.count === 0)) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No data yet</p>
      </div>
    );
  }

  return (
    <div className="h-48 w-full px-2 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
                  <p className="font-medium">{label}</p>
                  <p className="text-muted-foreground">
                    {payload[0].value} transcription{payload[0].value !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="count"
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-teal-500 dark:fill-teal-600"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
