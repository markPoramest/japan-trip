import { db } from "@/lib/db";
import NavbarClient from "./NavbarClient";

interface NavbarProps {
  tripId: string;
  currentSlug?: string;
  currentSection?: "overview" | "bookings" | "summary";
}

export default async function Navbar({ tripId, currentSlug, currentSection }: NavbarProps) {
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      days: { orderBy: { dayNumber: "asc" } },
    },
  });

  if (!trip) return null;

  return (
    <NavbarClient
      tripId={trip.id}
      tripTitle={trip.title}
      startDate={trip.startDate.toISOString()}
      endDate={trip.endDate.toISOString()}
      days={trip.days.map((d) => ({
        id: d.id,
        dayNumber: d.dayNumber,
        title: d.title,
        slug: d.slug,
      }))}
      currentSlug={currentSlug}
      currentSection={currentSection}
    />
  );
}
