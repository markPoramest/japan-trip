import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mayTrip = await prisma.trip.findFirst({
    where: { title: { contains: 'Central Japan' } }
  });

  if (!mayTrip) {
    console.error('May trip not found');
    return;
  }

  // Check if flight exists or create one
  const existingFlight = await prisma.flightBooking.findFirst({
    where: { tripId: mayTrip.id }
  });

  if (existingFlight) {
    await prisma.flightBooking.update({
      where: { id: existingFlight.id },
      data: { costThb: 18315 }
    });
    console.log(`Updated flight for May 2026 trip to 18315 THB (Flight ID: ${existingFlight.id})`);
  } else {
    const flight = await prisma.flightBooking.create({
      data: {
        tripId: mayTrip.id,
        flightNo: 'BKK ↔ NGO / NRT',
        route: 'Bangkok ↔ Nagoya / Narita',
        costThb: 18315,
        notes: 'Round-trip flight booking'
      }
    });
    console.log(`Created flight for May 2026 trip with 18315 THB (Flight ID: ${flight.id})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
