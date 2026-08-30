import { db } from "@/lib/db";
import TripsListClient from "@/components/TripsListClient";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const rawTrips = await db.trip.findMany({
    include: {
      days: {
        include: { activities: true },
      },
      hotels: true,
      passes: true,
      flights: true,
    },
    orderBy: { startDate: "desc" },
  });

  const trips = rawTrips.map((trip) => {
    const allActivities = trip.days.flatMap((d) => d.activities);
    const totalActivitiesJpy = allActivities.reduce((s, a) => s + (a.cost || 0), 0);
    const totalPassJpy = trip.passes.reduce((s, p) => s + (p.costJpy || 0), 0);
    const totalHotelThb = trip.hotels.reduce((s, h) => s + (h.costThb || 0), 0);
    const totalFlightThb = trip.flights.reduce((s, f) => s + (f.costThb || 0), 0);

    const grandTotalThb =
      (totalActivitiesJpy + totalPassJpy) * trip.exchangeRate +
      totalHotelThb +
      totalFlightThb;

    return {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      exchangeRate: trip.exchangeRate,
      totalActivitiesJpy,
      totalPassJpy,
      totalHotelThb,
      totalFlightThb,
      grandTotalThb,
      daysCount: trip.days.length,
      activitiesCount: allActivities.length,
    };
  });

  return <TripsListClient trips={trips} />;
}
