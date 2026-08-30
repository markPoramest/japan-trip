"use client";

export default function BookingsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Title */}
      <div className="space-y-2">
        <div className="w-56 h-8 bg-border/70 rounded-xl" />
        <div className="w-80 h-4 bg-border/40 rounded" />
      </div>

      {/* Hotel Table Skeleton */}
      <div className="bg-bg-card border border-border rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-border/60" />
            <div className="space-y-1">
              <div className="w-32 h-5 bg-border/70 rounded" />
              <div className="w-48 h-3 bg-border/40 rounded" />
            </div>
          </div>
          <div className="w-24 h-6 bg-border/60 rounded" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-bg-surface rounded-xl border border-border/60" />
          ))}
        </div>
      </div>

      {/* Passes & Flights Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-border rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-border/60" />
            <div className="w-28 h-5 bg-border/70 rounded" />
          </div>
          <div className="h-20 bg-bg-surface rounded-2xl border border-border/60" />
          <div className="h-20 bg-bg-surface rounded-2xl border border-border/60" />
        </div>

        <div className="bg-bg-card border border-border rounded-3xl p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-border/60" />
            <div className="w-24 h-5 bg-border/70 rounded" />
          </div>
          <div className="h-20 bg-bg-surface rounded-2xl border border-border/60" />
          <div className="h-20 bg-bg-surface rounded-2xl border border-border/60" />
        </div>
      </div>
    </div>
  );
}
