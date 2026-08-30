import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

function formatExcelTime(val) {
  if (val === null || val === undefined || val === '' || val === 'XXXX') return '';
  if (typeof val === 'number') {
    if (val < 0 || val >= 1) return '';
    const totalMinutes = Math.round(val * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
  return String(val).trim();
}

function cleanText(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (s === 'System.Xml.XmlElement') return '';
  return s;
}

async function main() {
  console.log('Importing plan-feb-2026.xlsx ...');

  const excelPath = path.join(process.cwd(), 'plan-feb-2026.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('plan-feb-2026.xlsx not found at', excelPath);
    return;
  }

  const workbook = XLSX.readFile(excelPath);

  // Remove old if exists
  const existing = await prisma.trip.findFirst({
    where: { title: { contains: 'Pre-Central Japan' } }
  });
  if (existing) {
    console.log('Pre-Central Japan trip already exists. Deleting and re-importing...');
    await prisma.dayActivity.deleteMany({ where: { day: { tripId: existing.id } } });
    await prisma.tripDay.deleteMany({ where: { tripId: existing.id } });
    await prisma.hotelBooking.deleteMany({ where: { tripId: existing.id } });
    await prisma.passBooking.deleteMany({ where: { tripId: existing.id } });
    await prisma.flightBooking.deleteMany({ where: { tripId: existing.id } });
    await prisma.budgetWallet.deleteMany({ where: { tripId: existing.id } });
    await prisma.trip.delete({ where: { id: existing.id } });
  }

  // 1. Create trip
  const trip = await prisma.trip.create({
    data: {
      title: 'Pre-Central Japan Trip (Tokyo, Ito, Kawazu, Karuizawa)',
      startDate: new Date('2026-02-14T00:00:00Z'),
      endDate: new Date('2026-02-18T23:59:59Z'),
      description: 'Short 5-day Tokyo-base trip — Kawazu Sakura cherry blossoms in Izu, Mt. Omuro ropeway, Jogasaki Coast, Karuizawa in winter, and Tokyo Tower.',
      currency: 'JPY',
      baseCurrency: 'THB',
      exchangeRate: 0.24,
    },
  });

  console.log(`Created Trip: ${trip.title} (ID: ${trip.id})`);

  // 2. Hotels
  await prisma.hotelBooking.create({
    data: {
      tripId: trip.id,
      name: 'ELE Hotel Higashi Ueno',
      dateRange: '14–18 Feb 2026',
      costThb: 3743.38,
      costJpy: Math.round(3743.38 / 0.24),
      notes: '~5000 baht total; ฿750 overpaid by Beer',
    },
  });

  // 3. Passes & transport
  const passes = [
    { name: 'JR Tokyo Wide Pass (15–17 Feb)', costJpy: 15000, costThb: 3000, notes: 'Covers Izu, Karuizawa shinkansen, and wide Tokyo area.' },
    { name: 'Skyliner Ueno ↔ Narita', costJpy: 4500, notes: 'Keisei Skyliner for airport access.' },
  ];
  for (const p of passes) {
    await prisma.passBooking.create({
      data: { tripId: trip.id, name: p.name, costJpy: p.costJpy, costThb: p.costThb || null, notes: p.notes || null },
    });
  }

  // 4. Flight
  await prisma.flightBooking.create({
    data: {
      tripId: trip.id,
      flightNo: 'TBD',
      route: 'BKK → NRT / NRT → BKK',
      costThb: 14927.52,
      notes: '~15,000 THB round trip',
    },
  });

  // 5. Budget wallets
  const budgets = [
    { category: 'เงินสด (Cash)', amountJpy: Math.round(20000 / 0.24), amountThb: 20000 },
    { category: 'IC Card (Suica/Pasmo)', amountJpy: Math.round(5000 / 0.24), amountThb: 5000 },
    { category: 'Travel Card', amountJpy: Math.round(25000 / 0.24), amountThb: 25000 },
  ];
  for (const b of budgets) {
    await prisma.budgetWallet.create({ data: { tripId: trip.id, ...b } });
  }

  // 6. Daily itineraries
  const dayMeta = [
    { slug: 'day-1-tokyo',      num: 1, date: '2026-02-14', dow: 'Sat', title: 'Tokyo (Arrival)' },
    { slug: 'day-2-ito',        num: 2, date: '2026-02-15', dow: 'Sun', title: 'Ito (Mt. Omuro & Jogasaki Coast)' },
    { slug: 'day-3-kawazu',     num: 3, date: '2026-02-16', dow: 'Mon', title: 'Kawazu (Sakura Festival)' },
    { slug: 'day-4-karuizawa',  num: 4, date: '2026-02-17', dow: 'Tue', title: 'Karuizawa' },
    { slug: 'day-5-tokyo',      num: 5, date: '2026-02-18', dow: 'Wed', title: 'Tokyo (Skytree & Departure)' },
  ];

  for (const meta of dayMeta) {
    const sheet = workbook.Sheets[meta.slug];
    if (!sheet) {
      console.warn(`Sheet not found: ${meta.slug}`);
      continue;
    }

    const tripDay = await prisma.tripDay.create({
      data: {
        tripId: trip.id,
        dayNumber: meta.num,
        date: new Date(meta.date + 'T00:00:00Z'),
        dayOfWeek: meta.dow,
        slug: meta.slug,
        title: meta.title,
      },
    });

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 'A', range: 3 });
    let order = 0;

    for (const row of rows) {
      const activityText = cleanText(row.C);
      if (!activityText || activityText.toLowerCase() === 'summary' || activityText.toLowerCase() === 'total') continue;

      const location = cleanText(row.B);
      if (!location && !activityText) continue;

      const formattedTime = formatExcelTime(row.A);
      const cost = Number(row.D) || 0;
      const isIcCard = row.E === 1 || row.E === '1' || row.E === true;
      const usingPass = row.F ? cleanText(row.F) : null;
      const remark = row.G ? cleanText(row.G) : null;

      await prisma.dayActivity.create({
        data: {
          dayId: tripDay.id,
          time: formattedTime,
          location: location || 'Location',
          activity: activityText,
          cost,
          isIcCard,
          usingPass: usingPass || null,
          remark: remark || null,
          sortOrder: order++,
        },
      });
    }

    console.log(`  ✓ Populated ${meta.slug} (${order} activities)`);
  }

  console.log('\n✅ plan-feb-2026.xlsx imported successfully!');
  console.log('   Trip ID:', trip.id);
}

main()
  .catch((e) => { console.error('Import failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
