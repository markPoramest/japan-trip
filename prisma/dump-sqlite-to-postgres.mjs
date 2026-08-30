import initSqlJs from 'sql.js';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' }
  });

  if (!user) {
    console.error('No user found in Postgres. Please log in first.');
    return;
  }

  console.log(`Target Postgres User: ${user.name} (${user.email}, ID: ${user.id})`);

  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (!fs.existsSync(dbPath)) {
    console.error('dev.db not found at', dbPath);
    return;
  }

  const SQL = await initSqlJs();
  const filebuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(filebuffer);

  // 1. Read Trips
  const tripRes = db.exec('SELECT * FROM Trip');
  if (!tripRes.length) {
    console.log('No trips found in SQLite dev.db.');
    return;
  }

  const tripColumns = tripRes[0].columns;
  const tripValues = tripRes[0].values;
  console.log(`Found ${tripValues.length} trips in SQLite dev.db.`);

  for (const row of tripValues) {
    const tripObj = {};
    tripColumns.forEach((col, idx) => {
      tripObj[col] = row[idx];
    });

    console.log(`\nMigrating Trip: ${tripObj.title} (SQLite ID: ${tripObj.id})`);

    // Create Trip in Postgres
    const newTrip = await prisma.trip.create({
      data: {
        userId: user.id,
        title: tripObj.title,
        startDate: new Date(tripObj.startDate),
        endDate: new Date(tripObj.endDate),
        description: tripObj.description || null,
        currency: tripObj.currency || 'JPY',
        baseCurrency: tripObj.baseCurrency || 'THB',
        exchangeRate: Number(tripObj.exchangeRate) || 0.24,
      },
    });

    console.log(`  -> Created in Postgres with ID: ${newTrip.id}`);

    // 2. Migrate Hotels
    const hotelRes = db.exec(`SELECT * FROM HotelBooking WHERE tripId = '${tripObj.id}'`);
    if (hotelRes.length) {
      const hCols = hotelRes[0].columns;
      for (const hRow of hotelRes[0].values) {
        const hObj = {};
        hCols.forEach((c, i) => { hObj[c] = hRow[i]; });

        await prisma.hotelBooking.create({
          data: {
            tripId: newTrip.id,
            name: hObj.name,
            dateRange: hObj.dateRange,
            checkIn: hObj.checkIn ? new Date(hObj.checkIn) : null,
            checkOut: hObj.checkOut ? new Date(hObj.checkOut) : null,
            costThb: hObj.costThb ? Number(hObj.costThb) : null,
            costJpy: hObj.costJpy ? Number(hObj.costJpy) : null,
            bookingRef: hObj.bookingRef || null,
            notes: hObj.notes || null,
          },
        });
      }
      console.log(`  -> Migrated ${hotelRes[0].values.length} hotels`);
    }

    // 3. Migrate Passes
    const passRes = db.exec(`SELECT * FROM PassBooking WHERE tripId = '${tripObj.id}'`);
    if (passRes.length) {
      const pCols = passRes[0].columns;
      for (const pRow of passRes[0].values) {
        const pObj = {};
        pCols.forEach((c, i) => { pObj[c] = pRow[i]; });

        await prisma.passBooking.create({
          data: {
            tripId: newTrip.id,
            name: pObj.name,
            costJpy: pObj.costJpy ? Number(pObj.costJpy) : null,
            costThb: pObj.costThb ? Number(pObj.costThb) : null,
            validDays: pObj.validDays ? Number(pObj.validDays) : null,
            notes: pObj.notes || null,
          },
        });
      }
      console.log(`  -> Migrated ${passRes[0].values.length} passes`);
    }

    // 4. Migrate Flights
    const flightRes = db.exec(`SELECT * FROM FlightBooking WHERE tripId = '${tripObj.id}'`);
    if (flightRes.length) {
      const fCols = flightRes[0].columns;
      for (const fRow of flightRes[0].values) {
        const fObj = {};
        fCols.forEach((c, i) => { fObj[c] = fRow[i]; });

        await prisma.flightBooking.create({
          data: {
            tripId: newTrip.id,
            flightNo: fObj.flightNo,
            route: fObj.route,
            departure: fObj.departure ? new Date(fObj.departure) : null,
            arrival: fObj.arrival ? new Date(fObj.arrival) : null,
            costJpy: fObj.costJpy ? Number(fObj.costJpy) : null,
            costThb: fObj.costThb ? Number(fObj.costThb) : null,
            notes: fObj.notes || null,
          },
        });
      }
      console.log(`  -> Migrated ${flightRes[0].values.length} flights`);
    }

    // 5. Migrate Budgets
    const budgetRes = db.exec(`SELECT * FROM BudgetWallet WHERE tripId = '${tripObj.id}'`);
    if (budgetRes.length) {
      const bCols = budgetRes[0].columns;
      for (const bRow of budgetRes[0].values) {
        const bObj = {};
        bCols.forEach((c, i) => { bObj[c] = bRow[i]; });

        await prisma.budgetWallet.create({
          data: {
            tripId: newTrip.id,
            category: bObj.category,
            amountJpy: Number(bObj.amountJpy) || 0,
            amountThb: Number(bObj.amountThb) || 0,
            notes: bObj.notes || null,
          },
        });
      }
      console.log(`  -> Migrated ${budgetRes[0].values.length} budget wallets`);
    }

    // 6. Migrate Trip Days & Activities
    const dayRes = db.exec(`SELECT * FROM TripDay WHERE tripId = '${tripObj.id}' ORDER BY dayNumber ASC`);
    if (dayRes.length) {
      const dCols = dayRes[0].columns;
      for (const dRow of dayRes[0].values) {
        const dObj = {};
        dCols.forEach((c, i) => { dObj[c] = dRow[i]; });

        const newDay = await prisma.tripDay.create({
          data: {
            tripId: newTrip.id,
            dayNumber: Number(dObj.dayNumber),
            date: new Date(dObj.date),
            dayOfWeek: dObj.dayOfWeek,
            slug: dObj.slug,
            title: dObj.title,
            notes: dObj.notes || null,
          },
        });

        // Activities for this day
        const actRes = db.exec(`SELECT * FROM DayActivity WHERE dayId = '${dObj.id}' ORDER BY sortOrder ASC`);
        if (actRes.length) {
          const aCols = actRes[0].columns;
          for (const aRow of actRes[0].values) {
            const aObj = {};
            aCols.forEach((c, i) => { aObj[c] = aRow[i]; });

            await prisma.dayActivity.create({
              data: {
                dayId: newDay.id,
                time: aObj.time || '',
                location: aObj.location || 'Location',
                activity: aObj.activity || '',
                cost: Number(aObj.cost) || 0,
                isIcCard: aObj.isIcCard === 1 || aObj.isIcCard === true,
                usingPass: aObj.usingPass || null,
                remark: aObj.remark || null,
                sortOrder: Number(aObj.sortOrder) || 0,
              },
            });
          }
        }
      }
      console.log(`  -> Migrated ${dayRes[0].values.length} days and all their activities`);
    }
  }

  console.log('\n🎉 ALL SQLITE TRIPS SUCCESSFULLY MIGRATED TO VERCEL POSTGRES!');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
