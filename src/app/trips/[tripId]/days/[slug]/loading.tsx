import DayTimelineSkeleton from "@/components/skeletons/DayTimelineSkeleton";

export default function DayLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <DayTimelineSkeleton />
    </div>
  );
}
