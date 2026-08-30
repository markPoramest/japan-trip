"use client";

import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DayTimelineSkeleton() {
  const { language } = useLanguage();

  return (
    <div className="space-y-6 relative">
      {/* Floating Active Loading Indicator Pill */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-bg-card/90 border border-accent/40 shadow-2xl backdrop-blur-md text-xs font-bold text-accent animate-in fade-in slide-in-from-bottom-3 duration-200">
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
        <span>{language === "th" ? "กำลังโหลดกิจกรรมประจำวัน..." : "Loading Daily Itinerary..."}</span>
      </div>

      {/* Day Header Skeleton */}
      <div className="bg-bg-card border border-border rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-16 h-5 skeleton-shimmer rounded-full" />
              <div className="w-28 h-4 skeleton-shimmer rounded" />
            </div>
            <div className="w-64 h-8 skeleton-shimmer rounded-xl" />
          </div>
          <div className="w-36 h-10 skeleton-shimmer rounded-xl" />
        </div>

        {/* 3 Day Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface border border-border rounded-xl p-3.5 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="w-20 h-3 skeleton-shimmer rounded" />
                <div className="w-24 h-5 skeleton-shimmer rounded" />
                <div className="w-16 h-2.5 skeleton-shimmer rounded" />
              </div>
              <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Activities Timeline List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-20 h-7 skeleton-shimmer rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="w-48 h-5 skeleton-shimmer rounded" />
              <div className="w-full max-w-md h-4 skeleton-shimmer rounded" />
              <div className="flex gap-2 pt-1">
                <div className="w-20 h-4 skeleton-shimmer rounded-full" />
                <div className="w-24 h-4 skeleton-shimmer rounded-full" />
              </div>
            </div>
            <div className="w-20 h-6 skeleton-shimmer rounded-lg self-end sm:self-start" />
          </div>
        ))}
      </div>
    </div>
  );
}
