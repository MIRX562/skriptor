"use client";

import { useEffect, useRef } from "react";
import { useDashboardStore } from "../store/dashboard-store";

export function TranscriptionStats() {
  const { stats, isLoading } = useDashboardStore();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading || !chartRef.current) return;

    // In a real app, this would use a charting library like Chart.js or Recharts
    // For now, we'll create a simple bar chart with CSS
    const renderChart = () => {
      const container = chartRef.current;
      if (!container) return;

      // Clear previous content
      container.innerHTML = "";

      // Create chart container
      const chartContainer = document.createElement("div");
      chartContainer.className = "flex items-end h-40 gap-2 mt-4";

      // Get max value for scaling
      const maxCount = Math.max(
        ...stats.transcriptionsByMonth.map((item) => item.count)
      );

      // Create bars
      stats.transcriptionsByMonth.forEach((item) => {
        const barContainer = document.createElement("div");
        barContainer.className = "flex flex-col items-center flex-1";

        const bar = document.createElement("div");
        const height = (item.count / maxCount) * 100;
        bar.className =
          "w-full bg-teal-500 dark:bg-teal-600 rounded-t transition-all duration-500";
        bar.style.height = `${height}%`;

        const label = document.createElement("div");
        label.className = "text-xs mt-2 text-muted-foreground";
        label.textContent = item.month;

        const value = document.createElement("div");
        value.className = "text-xs font-medium";
        value.textContent = item.count.toString();

        barContainer.appendChild(value);
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        chartContainer.appendChild(barContainer);
      });

      container.appendChild(chartContainer);
    };

    renderChart();
  }, [stats.transcriptionsByMonth, isLoading]);

  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading stats...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div ref={chartRef} className="w-full"></div>
    </div>
  );
}
