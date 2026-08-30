import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

function formatExcelTime(val) {
  if (val === null || val === undefined || val === '' || val === 'XXXX') return '';
  if (typeof val === 'number') {
    // Guard against bad values like 14.12 (Narai-juku row)
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
  // Skip XML parsing artifacts
  if (s === 'System.Xml.XmlElement') return '';
  return s;
}

async function main() {
  console.log('Importing plan-may-2026.xlsx into Japan Trip database...');

  const excelPath = path.join(process.cwd(), 'plan-may-2026.xlsx');
  if (!fs.existsSync(excelPath)) {
    console.error('plan-may-2026.xlsx not found at', excelPath);
    return;
  }

  const workbook = XLSX.readFile(excelPath);

  // Check if trip already exists
  const existing = await prisma.trip.findFirst({
    where: { title: { contains: 'Central Japan' } }
  });
  if (existing) {
    console.log('Central Japan trip already exists (id:', existing.id, '). Deleting and re-importing...');
    await prisma.dayActivity.deleteMany({ where: { day: { tripId: existing.id } } });
    await prisma.tripDay.deleteMany({ where: { tripId: existing.id } });
    await prisma.hotelBooking.deleteMany({ where: { tripId: existing.id } });
    await prisma.passBooking.deleteMany({ where: { tripId: existing.id } });
    await prisma.flightBooking.deleteMany({ where: { tripId: existing.id } });
    await prisma.budgetWallet.deleteMany({ where: { tripId: existing.id } });
    await prisma.trip.delete({ where: { id: existing.id } });
  }

  // 1. Create the trip
  const trip = await prisma.trip.create({
    data: {
      title: 'Central Japan Trip (Kanazawa, Alpine Route, Kamikochi, Nagoya)',
      startDate: new Date('2026-05-07T00:00:00Z'),
      endDate: new Date('2026-05-17T23:59:59Z'),
      description: 'Golden Week exploration of Central Japan — Hokuriku Shinkansen to Kanazawa, Shirakawago, Fukui, Tateyama Alpine Route, Kamikochi, Hakuba, Naraijuku, Nagoya, and Tokyo.',
      currency: 'JPY',
      baseCurrency: 'THB',
      exchangeRate: 0.24,
    },
  });

  console.log(`Created Trip: ${trip.title} (ID: ${trip.id})`);

  // 2. Hotels
  const hotels = [
    { name: 'Smile Hotel Premium Kanazawa Higashiguchi Ekimae', dateRange: '7–9 May 2026', costThb: 2843.0 },
    { name: 'Toyoko Inn Toyama-eki Shinkansen-guchi No.2', dateRange: '10–12 May 2026', costThb: 2214.81 },
    { name: 'Hotel Iidaya (Matsumoto)', dateRange: '12–15 May 2026', costThb: 4117.92 },
    { name: 'Toyoko Inn Chubu International Airport No1', dateRange: '15–17 May 2026', costThb: 1238.7 },
  ];
  for (const h of hotels) {
    await prisma.hotelBooking.create({
      data: {
        tripId: trip.id,
        name: h.name,
        dateRange: h.dateRange,
        costThb: h.costThb,
        costJpy: Math.round(h.costThb / 0.24),
      },
    });
  }

  // 3. Passes & reserved items
  const passes = [
    { name: 'Takayama-Hokuriku Area Tourist Pass', costJpy: 19800, notes: 'Covers JR limited express, Shinkansen, and buses in Hokuriku & Takayama area.' },
    { name: 'Tateyama Alpine Route (Reserved)', costJpy: 14360, notes: 'Full alpine route crossing: Tateyama → Kurobe Dam → Shinano Omachi.' },
    { name: 'Skyliner Ueno ↔ Narita', costJpy: 4500, notes: 'Keisei Skyliner for Narita airport access.' },
    { name: 'Bus to Kamikochi', costJpy: 5000, notes: 'https://japanbusonline.com/en/CourseSearch/11600350001' },
    { name: 'Kamikochi Back to Matsumoto', costJpy: 3810, notes: 'https://japanbusonline.com/en/CourseSearch/11600270201' },
  ];
  for (const p of passes) {
    await prisma.passBooking.create({
      data: { tripId: trip.id, name: p.name, costJpy: p.costJpy, notes: p.notes },
    });
  }

  // 4. Daily itineraries
  const dayMeta = [
    { slug: 'day-1-kanazawa',      num: 1,  date: '2026-05-07', dow: 'Thu', title: 'Kanazawa' },
    { slug: 'day-2-shirakawago',   num: 2,  date: '2026-05-08', dow: 'Fri', title: 'Shirakawago' },
    { slug: 'day-3-fukui',         num: 3,  date: '2026-05-09', dow: 'Sat', title: 'Fukui' },
    { slug: 'day-4-tojinbo',       num: 4,  date: '2026-05-10', dow: 'Sun', title: 'Tojinbo & Toyama' },
    { slug: 'day-5-toyama',        num: 5,  date: '2026-05-11', dow: 'Mon', title: 'Toyama & Takaoka' },
    { slug: 'day-6-alpine-route',  num: 6,  date: '2026-05-12', dow: 'Tue', title: 'Tateyama Alpine Route' },
    { slug: 'day-7-kamikochi',     num: 7,  date: '2026-05-13', dow: 'Wed', title: 'Kamikochi' },
    { slug: 'day-8-hakuba',        num: 8,  date: '2026-05-14', dow: 'Thu', title: 'Hakuba & Lake Suwa' },
    { slug: 'day-9-narai-juku',    num: 9,  date: '2026-05-15', dow: 'Fri', title: 'Narai-juku & Matsumoto Castle' },
    { slug: 'day-10-nagoya',       num: 10, date: '2026-05-16', dow: 'Sat', title: 'Nagoya' },
    { slug: 'day-11-tokyo',        num: 11, date: '2026-05-17', dow: 'Sun', title: 'Tokyo & Departure' },
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

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 'A', range: 3 }); // start row 4
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

  console.log('\n✅ plan-may-2026.xlsx imported successfully!');
  console.log('   Trip ID:', trip.id);
}

main()
  .catch((e) => { console.error('Import failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
