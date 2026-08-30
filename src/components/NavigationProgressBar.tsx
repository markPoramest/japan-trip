"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function NavigationProgressBar() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    let intervalId: NodeJS.Timeout | null = null;

    const stopLoading = () => {
      if (intervalId) clearInterval(intervalId);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
    };

    const handleAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;

      const target = event.target as HTMLElement;
      if (
        !target ||
        target.closest("button") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("[data-no-progress]")
      ) {
        return;
      }

      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        !anchor.target &&
        !anchor.hasAttribute("download") &&
        anchor.origin === window.location.origin
      ) {
        const url = new URL(anchor.href);
        const isSamePage =
          url.pathname === window.location.pathname &&
          url.search === window.location.search;

        if (!isSamePage && !url.hash.startsWith("#")) {
          setLoading(true);
          setProgress(35);

          if (intervalId) clearInterval(intervalId);
          intervalId = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? prev : prev + 12));
          }, 150);

          // Safety timeout
          setTimeout(stopLoading, 5000);
        }
      }
    };

    // Stop loader on page navigation / popstate
    window.addEventListener("popstate", stopLoading);
    document.addEventListener("click", handleAnchorClick);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("popstate", stopLoading);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  if (!mounted || (!loading && progress === 0)) return null;

  return (
    <>
      {/* Top glowing progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 pointer-events-none overflow-hidden">
        <div
          className="h-full bg-accent shadow-[0_0_12px_#EB5E28] transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Top-Right Mini Spinner Badge */}
      {loading && (
        <div className="fixed top-4 right-4 z-[9999] bg-bg-card/90 backdrop-blur-md border border-accent/30 text-accent px-3 py-1.5 rounded-full text-xs font-bold shadow-earth flex items-center gap-2 animate-in fade-in duration-150 pointer-events-none">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading...</span>
        </div>
      )}
    </>
  );
}
