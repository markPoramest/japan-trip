"use client";

export default function DayTimelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Day Header Skeleton */}
      <div className="bg-bg-card border border-border rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-16 h-5 bg-border/60 rounded-full" />
              <div className="w-28 h-4 bg-border/40 rounded" />
            </div>
            <div className="w-64 h-8 bg-border/70 rounded-xl" />
          </div>
          <div className="w-36 h-10 bg-border/60 rounded-xl" />
        </div>

        {/* 3 Day Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface border border-border rounded-xl p-3.5 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="w-20 h-3 bg-border/40 rounded" />
                <div className="w-24 h-5 bg-border/70 rounded" />
                <div className="w-16 h-2.5 bg-border/40 rounded" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-bg-card border border-border" />
            </div>
          ))}
        </div>
      </div>

      {/* Activities Timeline List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-20 h-7 bg-border/60 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="w-48 h-5 bg-border/70 rounded" />
              <div className="w-full max-w-md h-4 bg-border/40 rounded" />
              <div className="flex gap-2 pt-1">
                <div className="w-20 h-4 bg-border/40 rounded-full" />
                <div className="w-24 h-4 bg-border/40 rounded-full" />
              </div>
            </div>
            <div className="w-20 h-6 bg-border/60 rounded-lg self-end sm:self-start" />
          </div>
        ))}
      </div>
    </div>
  );
}
