"use client";

export default function TripOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="rounded-3xl bg-bg-card border border-border p-6 sm:p-8 flex flex-col justify-between h-48">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-24 h-5 bg-border/60 rounded-full" />
            <div className="w-16 h-5 bg-border/40 rounded-full" />
          </div>
          <div className="w-3/4 max-w-md h-8 bg-border/60 rounded-xl" />
          <div className="w-1/2 max-w-sm h-4 bg-border/40 rounded" />
        </div>
        <div className="flex items-center gap-4 pt-4 border-t border-border/40">
          <div className="w-36 h-4 bg-border/40 rounded" />
          <div className="w-28 h-4 bg-border/40 rounded" />
        </div>
      </div>

      {/* 4 Financial Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl bg-bg-card border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-border/60 rounded" />
              <div className="w-8 h-8 rounded-xl bg-border/50" />
            </div>
            <div className="space-y-1.5">
              <div className="w-28 h-7 bg-border/70 rounded-lg" />
              <div className="w-36 h-3.5 bg-border/40 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Itinerary Days Grid Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-36 h-6 bg-border/60 rounded-lg" />
          <div className="w-24 h-4 bg-border/40 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-bg-card border border-border rounded-2xl p-5 space-y-4 h-56 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-5 bg-border/60 rounded-lg" />
                  <div className="w-20 h-4 bg-border/40 rounded" />
                </div>
                <div className="w-40 h-5 bg-border/60 rounded" />
                <div className="flex gap-1 pt-1">
                  <div className="w-16 h-4 bg-border/40 rounded-md" />
                  <div className="w-16 h-4 bg-border/40 rounded-md" />
                </div>
              </div>
              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="w-20 h-5 bg-border/60 rounded" />
                <div className="w-24 h-7 bg-border/60 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
