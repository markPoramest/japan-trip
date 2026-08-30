"use client";

export default function TripListSkeleton() {
  return (
    <div className="min-h-screen bg-bg-base pb-20 animate-pulse">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-bg-surface/80 h-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-border/60" />
            <div className="space-y-1.5">
              <div className="w-32 h-4 bg-border/60 rounded" />
              <div className="w-20 h-2.5 bg-border/40 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-28 h-9 rounded-xl bg-border/60" />
            <div className="w-9 h-9 rounded-xl bg-border/60" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        {/* Hero Banner Skeleton */}
        <div className="rounded-3xl bg-bg-card border border-border p-8 h-44 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-32 h-5 bg-border/60 rounded-full" />
            <div className="w-3/4 max-w-md h-8 bg-border/60 rounded-xl" />
            <div className="w-1/2 max-w-sm h-4 bg-border/40 rounded" />
          </div>
        </div>

        {/* Trips Section Header Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-border/60" />
              <div className="w-36 h-6 bg-border/60 rounded-lg" />
              <div className="w-8 h-5 bg-border/40 rounded-full" />
            </div>
            <div className="w-24 h-4 bg-border/40 rounded" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-bg-card border border-border rounded-3xl p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-5 bg-border/60 rounded-full" />
                      <div className="w-20 h-5 bg-border/60 rounded-full" />
                    </div>
                    <div className="w-48 h-6 bg-border/60 rounded-lg" />
                    <div className="w-64 h-3 bg-border/40 rounded" />
                  </div>
                  <div className="w-10 h-10 bg-border/50 rounded-xl" />
                </div>

                <div className="w-40 h-4 bg-border/40 rounded" />

                <div className="pt-4 border-t border-border/60 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-14 bg-bg-surface rounded-xl border border-border/60" />
                    <div className="h-14 bg-bg-surface rounded-xl border border-border/60" />
                    <div className="h-14 bg-bg-surface rounded-xl border border-border/60" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 bg-border/40 rounded" />
                    <div className="w-28 h-8 bg-border/60 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
