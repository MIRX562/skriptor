"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (!resolvedTheme) {
    return null;
  }

  const toggleTheme = () => {
    // Toggle between light and dark themes
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          theme === "dark" ? "hidden" : ""
        }`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all ${
          theme === "dark" ? "" : "hidden"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
