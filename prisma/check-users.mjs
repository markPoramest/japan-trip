import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in Postgres:`);
  console.log(JSON.stringify(users, null, 2));

  const trips = await prisma.trip.findMany();
  console.log(`Found ${trips.length} trips in Postgres:`);
  console.log(JSON.stringify(trips, null, 2));
}

main().finally(() => prisma.$disconnect());
