import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const trips = await prisma.trip.findMany({
    include: {
      days: { include: { activities: true } },
      hotels: true,
      passes: true,
      flights: true,
      budgets: true
    }
  });

  console.log(`Found ${trips.length} trips in SQLite DB:`);
  for (const t of trips) {
    const actCost = t.days.flatMap(d => d.activities).reduce((s, a) => s + (a.cost || 0), 0);
    const passCost = t.passes.reduce((s, p) => s + (p.costJpy || 0), 0);
    const hotelCostThb = t.hotels.reduce((s, h) => s + (h.costThb || 0), 0);
    const flightCostThb = t.flights.reduce((s, f) => s + (f.costThb || 0), 0);
    const totalThb = (actCost + passCost) * t.exchangeRate + hotelCostThb + flightCostThb;

    console.log(`\n- Trip: ${t.title}`);
    console.log(`  Dates: ${t.startDate.toISOString().slice(0,10)} to ${t.endDate.toISOString().slice(0,10)}`);
    console.log(`  Days: ${t.days.length}, Activities: ${t.days.flatMap(d => d.activities).length}`);
    console.log(`  Flights: ${flightCostThb} THB`);
    console.log(`  Hotels: ${hotelCostThb} THB`);
    console.log(`  Grand Total: ${totalThb.toFixed(2)} THB`);
  }
}

main().finally(() => prisma.$disconnect());
