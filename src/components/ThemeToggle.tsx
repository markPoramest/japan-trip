"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      applyTheme(initial);
    }
  }, []);

  function applyTheme(newTheme: "dark" | "light") {
    const root = document.documentElement;
    if (newTheme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl bg-bg-surface border border-border flex items-center justify-center opacity-50" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to White / Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-xl bg-bg-card hover:bg-bg-surface border border-border flex items-center justify-center text-text-secondary hover:text-accent transition-all shadow-sm hover:scale-105 active:scale-95"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-accent animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-accent animate-in fade-in zoom-in duration-200" />
      )}
    </button>
  );
}
