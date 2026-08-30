import BookingsSkeleton from "@/components/skeletons/BookingsSkeleton";

export default function BookingsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <BookingsSkeleton />
    </div>
  );
}
