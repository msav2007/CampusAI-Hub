"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 sm:w-[108px] sm:h-9 bg-surface-2/40 rounded-full animate-pulse border border-border/40" />
    );
  }

  return (
    <>
      {/* Desktop segmented control */}
      <div className="hidden sm:flex items-center p-1 border border-border/40 rounded-full bg-surface-2/40 backdrop-blur-md">
        <button
          onClick={() => setTheme("light")}
          className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-200 ${
            theme === "light"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
          }`}
          title="Light Mode"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme("system")}
          className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-200 ${
            theme === "system"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
          }`}
          title="System Default"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`p-1.5 rounded-full flex items-center justify-center transition-all duration-200 ${
            theme === "dark"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
          }`}
          title="Dark Mode"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile compact toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (theme === "light") setTheme("dark");
          else if (theme === "dark") setTheme("system");
          else setTheme("light");
        }}
        className="h-9 w-9 rounded-full relative sm:hidden border border-border/40 bg-surface-2/40 shadow-sm"
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
    </>
  );
}
