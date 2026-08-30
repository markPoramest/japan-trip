"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Sun, Moon, Globe, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// Vector Flag for Thailand (Trairanga)
function ThaiFlag({ className = "w-4 h-3" }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[2px] shadow-sm flex-shrink-0`} viewBox="0 0 900 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#A51931" />
      <rect y="100" width="900" height="400" fill="#F4F5F8" />
      <rect y="200" width="900" height="200" fill="#2D2A4A" />
    </svg>
  );
}

// Vector Flag for UK / English
function UKFlag({ className = "w-4 h-3" }: { className?: string }) {
  return (
    <svg className={`${className} rounded-[2px] shadow-sm flex-shrink-0`} viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="3" />
      <path d="M30 0V30M0 15H60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0V30M0 15H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}

export default function SettingsKebab() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { language, setLanguage, t } = useLanguage();

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

  // Handle outside click & escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

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

  function handleSetTheme(newTheme: "dark" | "light") {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  }

  return (
    <div className="relative inline-block text-left z-50" ref={menuRef}>
      {/* Kebab trigger button */}
      <button
        type="button"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={t("settings")}
        className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all shadow-sm active:scale-95 select-none ${
          isOpen
            ? "bg-accent text-white border-accent shadow-accent scale-105"
            : "bg-bg-card hover:bg-bg-surface border-border text-text-secondary hover:text-accent"
        }`}
      >
        <MoreVertical className="w-4 h-4 pointer-events-none" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-bg-card border border-border p-3.5 shadow-earth z-[100] animate-in fade-in zoom-in-95 duration-150 space-y-3"
          role="menu"
        >
          {/* Header */}
          <div className="px-2 py-1 flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
              {t("settings")}
            </span>
            <span className="text-[10px] text-text-muted font-mono bg-bg-surface px-2 py-0.5 rounded-md border border-border/40 flex items-center gap-1.5">
              {language === "th" ? <ThaiFlag className="w-3.5 h-2.5" /> : <UKFlag className="w-3.5 h-2.5" />}
              <span>{language.toUpperCase()} · {theme === "dark" ? "DARK" : "LIGHT"}</span>
            </span>
          </div>

          {/* Theme Section */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-text-muted px-2 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-3 h-3 text-accent" /> {t("appearance")}
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-bg-surface p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => handleSetTheme("dark")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  theme === "dark"
                    ? "bg-accent text-white shadow-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t("darkMode")}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetTheme("light")}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  theme === "light"
                    ? "bg-accent text-white shadow-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t("lightMode")}</span>
              </button>
            </div>
          </div>

          {/* Language Section with Vector SVG Flags */}
          <div className="space-y-1.5 pt-1 border-t border-border/60">
            <div className="text-[11px] font-bold text-text-muted px-2 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-accent" /> {t("language")}
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-bg-surface p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  language === "en"
                    ? "bg-accent text-white shadow-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
              >
                <UKFlag className="w-4 h-3" />
                <span>English</span>
                {language === "en" && <Check className="w-3 h-3 ml-auto" />}
              </button>
              <button
                type="button"
                onClick={() => setLanguage("th")}
                className={`flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  language === "th"
                    ? "bg-accent text-white shadow-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
              >
                <ThaiFlag className="w-4 h-3" />
                <span>ไทย</span>
                {language === "th" && <Check className="w-3 h-3 ml-auto" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
