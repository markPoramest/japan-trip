import Navbar from "@/components/Navbar";
import BookingsClient from "@/components/BookingsClient";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Props {
  params: { tripId: string };
}

export default async function BookingsPage({ params }: Props) {
  const session = await getAuthSession();
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/login");

  const trip = await db.trip.findUnique({
    where: { id: params.tripId },
    include: {
      hotels: { orderBy: { createdAt: "asc" } },
      passes: true,
      flights: true,
      budgets: true,
      days: { include: { activities: true } },
    },
  });

  if (!trip) notFound();
  if (trip.userId && trip.userId !== userId) notFound();

  const allActivities = trip.days.flatMap((d) => d.activities);
  const totalIcSpendJpy = allActivities.filter((a) => a.isIcCard).reduce((s, a) => s + (a.cost || 0), 0);
  const totalNonIcSpendJpy = allActivities.reduce((s, a) => s + (a.cost || 0), 0) - totalIcSpendJpy;

  return (
    <div className="min-h-screen bg-bg-base pb-16">
      <Navbar tripId={trip.id} currentSection="bookings" />
      <BookingsClient
        trip={trip}
        totalIcSpendJpy={totalIcSpendJpy}
        totalNonIcSpendJpy={totalNonIcSpendJpy}
      />
    </div>
  );
}
