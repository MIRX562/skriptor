import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface TranscriptionByMonth {
  month: string;
  count: number;
}

interface RecentTranscription {
  id: string | number;
  title: string;
  date: string;
  duration: string;
  status: string;
}

interface DashboardStats {
  totalTranscriptions: number;
  hoursProcessed: number;
  usagePercentage: number;
  accuracy: number;
  recentTranscriptions: RecentTranscription[];
  transcriptionsByMonth: TranscriptionByMonth[];
}

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  setError: (error: string | null) => void;
}

const initialStats: DashboardStats = {
  totalTranscriptions: 0,
  hoursProcessed: 0,
  usagePercentage: 0,
  accuracy: 0,
  recentTranscriptions: [],
  transcriptionsByMonth: [],
};

export const useDashboardStore = create<DashboardState>()(
  devtools((set) => ({
    stats: initialStats,
    isLoading: false,
    error: null,

    fetchDashboardData: async () => {
      set({ isLoading: true, error: null });

      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const transcriptionsByMonth: TranscriptionByMonth[] = [
          { month: "Jan", count: 8 },
          { month: "Feb", count: 12 },
          { month: "Mar", count: 15 },
          { month: "Apr", count: 18 },
          { month: "May", count: 24 },
          { month: "Jun", count: 30 },
          { month: "Jul", count: 22 },
        ];

        const recentTranscriptions: RecentTranscription[] = [
          {
            id: "1",
            title: "Team Meeting",
            date: "May 15, 2023",
            duration: "45:22",
            status: "completed",
          },
          {
            id: "2",
            title: "Product Interview",
            date: "May 12, 2023",
            duration: "32:14",
            status: "completed",
          },
          {
            id: "3",
            title: "Customer Feedback",
            date: "May 10, 2023",
            duration: "18:45",
            status: "completed",
          },
          {
            id: "4",
            title: "Quarterly Review",
            date: "May 5, 2023",
            duration: "58:30",
            status: "completed",
          },
        ];

        set({
          stats: {
            totalTranscriptions: 24,
            hoursProcessed: 5.2,
            usagePercentage: 65,
            accuracy: 98.3,
            recentTranscriptions,
            transcriptionsByMonth,
          },
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        set({
          error: "Failed to load dashboard data. Please try again.",
          isLoading: false,
        });
      }
    },

    setError: (error) => set({ error }),
  }))
);
