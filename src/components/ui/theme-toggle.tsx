"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9 rounded-full relative"
    >
      <Sun
        className="h-4 w-4 absolute transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
        style={{ opacity: theme === "light" ? 1 : 0 }}
      />
      <Moon
        className="h-4 w-4 absolute transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100"
        style={{ opacity: theme === "dark" ? 1 : 0 }}
      />
      <Monitor
        className="h-4 w-4 absolute transition-all"
        style={{ opacity: theme === "system" ? 1 : 0 }}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
