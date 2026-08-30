import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

function formatExcelTime(val) {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'number') {
    const totalMinutes = Math.round(val * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
  return String(val).trim();
}

async function main() {
  console.log('Seeding Japan Trip database from Plan B.xlsx...');

  const excelPath = path.join(process.cwd(), 'Plan B.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('Plan B.xlsx not found at', excelPath);
    return;
  }

  const workbook = XLSX.readFile(excelPath);

  // 1. Create or reset Trip
  // Delete existing
  await prisma.dayActivity.deleteMany();
  await prisma.tripDay.deleteMany();
  await prisma.hotelBooking.deleteMany();
  await prisma.passBooking.deleteMany();
  await prisma.flightBooking.deleteMany();
  await prisma.budgetWallet.deleteMany();
  await prisma.trip.deleteMany();

  const trip = await prisma.trip.create({
    data: {
      title: 'Seikan Route Trip (Hirosaki, Aomori, Hakodate, Sapporo, Otaru)',
      startDate: new Date('2026-10-21T00:00:00Z'),
      endDate: new Date('2026-10-26T23:59:59Z'),
      description: 'Autumn foliage & scenic Seikan route journey from Tokyo to Hokkaido via Shinkansen & scenic routes.',
      currency: 'JPY',
      baseCurrency: 'THB',
      exchangeRate: 0.24,
    },
  });

  console.log(`Created Trip: ${trip.title} (ID: ${trip.id})`);

  // 2. Parse Summary Sheet for Hotels, Passes, Flights, Budgets
  const summarySheet = workbook.Sheets['summary'];
  if (summarySheet) {
    // Hotel Bookings from rows 12-14
    const hotels = [
      { name: 'Rembrandt Inn Aomori', dateRange: '21-23 Oct 2026', costThb: 2512.88, checkIn: new Date('2026-10-21'), checkOut: new Date('2026-10-23') },
      { name: 'Hotel Global View Hakodate', dateRange: '23-25 Oct 2026', costThb: 3127.36, checkIn: new Date('2026-10-23'), checkOut: new Date('2026-10-25') },
      { name: 'APA Hotel TKP Sapporo Ekimae', dateRange: '25-26 Oct 2026', costThb: 1347.47, checkIn: new Date('2026-10-25'), checkOut: new Date('2026-10-26') },
    ];

    for (const h of hotels) {
      await prisma.hotelBooking.create({
        data: {
          tripId: trip.id,
          name: h.name,
          dateRange: h.dateRange,
          checkIn: h.checkIn,
          checkOut: h.checkOut,
          costThb: h.costThb,
          costJpy: Math.round(h.costThb / 0.24),
        },
      });
    }

    // Passes
    await prisma.passBooking.create({
      data: {
        tripId: trip.id,
        name: 'JR East-South Hokkaido Rail Pass (6 Days)',
        costJpy: 40000,
        validDays: 6,
        notes: 'Covers Narita/Haneda, Tokyo to Tohoku (Aomori, Hirosaki) and South Hokkaido (Hakodate, Otaru, Sapporo, New Chitose).',
      },
    });

    // Flight
    await prisma.flightBooking.create({
      data: {
        tripId: trip.id,
        flightNo: 'NH850 / Return Flight',
        route: 'BKK <-> HND / CTS -> BKK',
        costThb: 16200,
        notes: 'All Nippon Airways (ANA) flight landing at Haneda & departing New Chitose.',
      },
    });

    // Budget allocations
    const budgets = [
      { category: 'IC Card (Suica / Pasmo)', amountJpy: 10000, amountThb: 2400 },
      { category: 'Cash / Pocket Money (เงินสด)', amountJpy: 40000, amountThb: 9600 },
      { category: 'Travel Card (Wise / YouTrip)', amountJpy: 50000, amountThb: 12000 },
    ];

    for (const b of budgets) {
      await prisma.budgetWallet.create({
        data: {
          tripId: trip.id,
          category: b.category,
          amountJpy: b.amountJpy,
          amountThb: b.amountThb,
        },
      });
    }
  }

  // 3. Parse Daily Itineraries (day-1-hirosaki to day-6-otaru)
  const daySheetNames = workbook.SheetNames.filter(name => name.startsWith('day-'));

  const dayMeta = [
    { slug: 'day-1-hirosaki', num: 1, date: new Date('2026-10-21'), dow: 'Wed', title: 'Hirosaki & Aomori' },
    { slug: 'day-2-oirase', num: 2, date: new Date('2026-10-22'), dow: 'Thu', title: 'Oirase Gorge & Lake Towada' },
    { slug: 'day-3-hakkoda', num: 3, date: new Date('2026-10-23'), dow: 'Fri', title: 'Hakkoda Ropeway & Hakodate' },
    { slug: 'day-4-hakodate', num: 4, date: new Date('2026-10-24'), dow: 'Sat', title: 'Hakodate & Mt. Hakodate' },
    { slug: 'day-5-onuma', num: 5, date: new Date('2026-10-25'), dow: 'Sun', title: 'Onuma Park & Sapporo' },
    { slug: 'day-6-otaru', num: 6, date: new Date('2026-10-26'), dow: 'Mon', title: 'Otaru & New Chitose' },
  ];

  for (const meta of dayMeta) {
    const sheet = workbook.Sheets[meta.slug];
    if (!sheet) continue;

    const tripDay = await prisma.tripDay.create({
      data: {
        tripId: trip.id,
        dayNumber: meta.num,
        date: meta.date,
        dayOfWeek: meta.dow,
        slug: meta.slug,
        title: meta.title,
      },
    });

    // Read rows from row 4 down until summary row
    // Sheet is structured:
    // A: Time, B: Location, C: Activity, D: Cost, E: IC Card, F: Using Pass, G: Remark
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 'A', range: 3 }); // start at row 4 (0-indexed: 3)

    let order = 0;
    for (const row of rows) {
      const activityText = String(row.C || '').trim();
      if (!activityText || activityText.toLowerCase() === 'summary' || activityText.toLowerCase() === 'total') {
        continue;
      }

      const formattedTime = formatExcelTime(row.A);
      const location = String(row.B || '').trim();
      const cost = Number(row.D) || 0;
      const isIcCard = row.E === 1 || row.E === '1' || row.E === true;
      const usingPass = row.F ? String(row.F).trim() : null;
      const remark = row.G ? String(row.G).trim() : null;

      await prisma.dayActivity.create({
        data: {
          dayId: tripDay.id,
          time: formattedTime,
          location: location || 'Location',
          activity: activityText,
          cost: cost,
          isIcCard: isIcCard,
          usingPass: usingPass,
          remark: remark,
          sortOrder: order++,
        },
      });
    }

    console.log(`Populated ${meta.slug} with activities.`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
