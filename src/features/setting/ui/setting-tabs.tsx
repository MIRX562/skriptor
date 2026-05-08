"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  Lock,
  LogOut,
  SquareArrowUpLeft,
  User,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SignOut } from "@/features/sign-out/model/query";

interface SettingsTabsProps {
  children: ReactNode;
}

export function SettingsTabs({ children }: SettingsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract the last part of the path to determine the active tab
  const currentTab = pathname.split("/").pop() || "profile";

  const handleTabChange = (value: string) => {
    if (value !== "back" && value !== "") {
      router.push(`/settings/${value}`);
    }
  };

  const tabs = [
    {
      value: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4 mr-2" />,
    },
    {
      value: "password",
      label: "Password",
      icon: <Lock className="h-4 w-4 mr-2" />,
    },
    {
      value: "help",
      label: "Help",
      icon: <HelpCircle className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
      <div className="w-full md:w-64 shrink-0">
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          orientation="vertical"
          className="w-full"
        >
          <TabsList className="w-full flex flex-col h-auto justify-start bg-white dark:bg-slate-900/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-3 py-2 mb-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Account Settings
              </h2>
            </div>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="w-full justify-start px-4 py-2.5 h-10 mb-1 rounded-xl transition-all duration-200 text-slate-600 dark:text-slate-400 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-500/10 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-sm data-[state=active]:font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1">
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px]">
          {children}
        </div>
      </div>
    </div>
  );
}
