import TripOverviewSkeleton from "@/components/skeletons/TripOverviewSkeleton";

export default function TripOverviewLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <TripOverviewSkeleton />
    </div>
  );
}
