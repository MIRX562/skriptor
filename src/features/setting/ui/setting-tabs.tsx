"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  Lock,
  LogOut,
  Settings,
  User,
  Wallet,
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
    router.push(`/settings/${value}`);
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
      value: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4 mr-2" />,
    },
    {
      value: "subscription",
      label: "Subscription",
      icon: <CreditCard className="h-4 w-4 mr-2" />,
    },
    {
      value: "payment-methods",
      label: "Payment Methods",
      icon: <Wallet className="h-4 w-4 mr-2" />,
    },
    {
      value: "billing-history",
      label: "Billing History",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
    {
      value: "help",
      label: "Help Center",
      icon: <HelpCircle className="h-4 w-4 mr-2" />,
    },
    {
      value: "support",
      label: "Contact Support",
      icon: <LifeBuoy className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        orientation="vertical"
        className="w-full md:w-64 shrink-0"
      >
        <TabsList className="w-full flex flex-col h-auto justify-start bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="w-full justify-start px-3 py-2 h-9 mb-1 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 dark:data-[state=active]:bg-teal-900/20 dark:data-[state=active]:text-teal-400"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
          <Separator />
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 mx-2">
            <TabsTrigger
              value="logout"
              className="justify-start px-3 py-2 h-9 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => SignOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </TabsTrigger>
          </div>
        </TabsList>
      </Tabs>

      <div className="flex-1">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
