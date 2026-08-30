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
  // 1. Find user in Postgres
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' }
  });

  if (!user) {
    console.error('No user found in Postgres. Please log in first.');
    return;
  }

  console.log(`Migrating trips to user: ${user.name} (${user.email}, ID: ${user.id})`);

  // ─────────────────────────────────────────────
  // 1. Migrate Main Trip: Plan B.xlsx (Seikan Route Trip - Oct 2026)
  // ─────────────────────────────────────────────
  const planBPath = path.join(process.cwd(), 'Plan B.xlsx');
  if (fs.existsSync(planBPath)) {
    console.log('\n--- Importing Plan B.xlsx (Seikan Route) ---');
    const wb = XLSX.readFile(planBPath);

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
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

    // Hotels
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

    // Days & Activities
    const dayMeta = [
      { slug: 'day-1-hirosaki', num: 1, date: new Date('2026-10-21'), dow: 'Wed', title: 'Hirosaki & Aomori' },
      { slug: 'day-2-oirase', num: 2, date: new Date('2026-10-22'), dow: 'Thu', title: 'Oirase Gorge & Lake Towada' },
      { slug: 'day-3-hakkoda', num: 3, date: new Date('2026-10-23'), dow: 'Fri', title: 'Hakkoda Ropeway & Hakodate' },
      { slug: 'day-4-hakodate', num: 4, date: new Date('2026-10-24'), dow: 'Sat', title: 'Hakodate & Mt. Hakodate' },
      { slug: 'day-5-onuma', num: 5, date: new Date('2026-10-25'), dow: 'Sun', title: 'Onuma Park & Sapporo' },
      { slug: 'day-6-otaru', num: 6, date: new Date('2026-10-26'), dow: 'Mon', title: 'Otaru & New Chitose' },
    ];

    for (const meta of dayMeta) {
      const sheet = wb.Sheets[meta.slug];
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

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 'A', range: 3 });
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
      console.log(`  - Migrated ${meta.slug}`);
    }
  }

  // ─────────────────────────────────────────────
  // 2. Migrate Feb 2026 Trip (if file exists)
  // ─────────────────────────────────────────────
  const febPath = path.join(process.cwd(), 'plan-feb-2026.xlsx');
  if (fs.existsSync(febPath)) {
    console.log('\n--- Importing plan-feb-2026.xlsx (Tokyo & Kawaguchiko Winter Trip) ---');
    const wb = XLSX.readFile(febPath);

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        title: 'Tokyo & Kawaguchiko Winter Trip (Feb 2026)',
        startDate: new Date('2026-02-14T00:00:00Z'),
        endDate: new Date('2026-02-20T23:59:59Z'),
        description: 'Winter Mt. Fuji views, Kawaguchiko Onsen, Tokyo neighborhoods and shopping journey.',
        currency: 'JPY',
        baseCurrency: 'THB',
        exchangeRate: 0.24,
      },
    });

    console.log(`Created Trip: ${trip.title} (ID: ${trip.id})`);

    const summarySheet = wb.Sheets['summary'];
    if (summarySheet) {
      // Hotels
      const hotels = [
        { name: 'Hotel Mystays Premier Omori', dateRange: '14-16 Feb 2026', costThb: 3450.00, checkIn: new Date('2026-02-14'), checkOut: new Date('2026-02-16') },
        { name: 'Fuji View Hotel Kawaguchiko', dateRange: '16-18 Feb 2026', costThb: 5200.00, checkIn: new Date('2026-02-16'), checkOut: new Date('2026-02-18') },
        { name: 'Candeo Hotels Tokyo Shimbashi', dateRange: '18-20 Feb 2026', costThb: 4100.00, checkIn: new Date('2026-02-18'), checkOut: new Date('2026-02-20') },
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
          name: 'Tokyo Subway 72hr Ticket + Fuji Excursion Roundtrip',
          costJpy: 12500,
          validDays: 6,
          notes: 'Unlimited Tokyo Metro & Toei Subway lines plus direct express to Kawaguchiko.',
        },
      });

      // Flight
      await prisma.flightBooking.create({
        data: {
          tripId: trip.id,
          flightNo: 'TG642 / TG643',
          route: 'BKK <-> NRT',
          costThb: 17500,
          notes: 'Thai Airways direct flight BKK - NRT.',
        },
      });

      // Budget allocations
      const budgets = [
        { category: 'IC Card (Welcome Suica)', amountJpy: 12000, amountThb: 2880 },
        { category: 'Cash / Pocket Money (เงินสด)', amountJpy: 35000, amountThb: 8400 },
        { category: 'Travel Card (Wise / YouTrip)', amountJpy: 45000, amountThb: 10800 },
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

    // Days
    const daySheetNames = wb.SheetNames.filter(name => name.startsWith('day-'));
    let dayNum = 1;
    for (const name of daySheetNames) {
      const sheet = wb.Sheets[name];
      if (!sheet) continue;

      const dateObj = new Date('2026-02-14T00:00:00Z');
      dateObj.setDate(dateObj.getDate() + (dayNum - 1));

      const tripDay = await prisma.tripDay.create({
        data: {
          tripId: trip.id,
          dayNumber: dayNum,
          date: dateObj,
          dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()],
          slug: name,
          title: `Day ${dayNum} - ${name.replace('day-', '').replace(/-/g, ' ').toUpperCase()}`,
        },
      });

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 'A', range: 3 });
      let order = 0;
      for (const row of rows) {
        const activityText = cleanText(row.C);
        if (!activityText || activityText.toLowerCase() === 'summary' || activityText.toLowerCase() === 'total') continue;

        await prisma.dayActivity.create({
          data: {
            dayId: tripDay.id,
            time: formatExcelTime(row.A),
            location: cleanText(row.B) || 'Location',
            activity: activityText,
            cost: Number(row.D) || 0,
            isIcCard: row.E === 1 || row.E === '1' || row.E === true,
            usingPass: cleanText(row.F) || null,
            remark: cleanText(row.G) || null,
            sortOrder: order++,
          },
        });
      }
      console.log(`  - Migrated ${name}`);
      dayNum++;
    }
  }

  // ─────────────────────────────────────────────
  // 3. Migrate May 2026 Trip (if file exists)
  // ─────────────────────────────────────────────
  const mayPath = path.join(process.cwd(), 'plan-may-2026.xlsx');
  if (fs.existsSync(mayPath)) {
    console.log('\n--- Importing plan-may-2026.xlsx (Tateyama Kurobe Alpine Route) ---');
    const wb = XLSX.readFile(mayPath);

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        title: 'Alpine Route & Central Japan (May 2026)',
        startDate: new Date('2026-05-08T00:00:00Z'),
        endDate: new Date('2026-05-14T23:59:59Z'),
        description: 'Tateyama Kurobe Snow Wall (Yuki-no-Otani), Matsumoto Castle, Takayama old town & Shirakawa-go.',
        currency: 'JPY',
        baseCurrency: 'THB',
        exchangeRate: 0.24,
      },
    });

    console.log(`Created Trip: ${trip.title} (ID: ${trip.id})`);

    const summarySheet = wb.Sheets['summary'];
    if (summarySheet) {
      const hotels = [
        { name: 'Matsumoto Buena Vista', dateRange: '08-10 May 2026', costThb: 3800.00, checkIn: new Date('2026-05-08'), checkOut: new Date('2026-05-10') },
        { name: 'Hotel Grand Terrace Toyama', dateRange: '10-12 May 2026', costThb: 3400.00, checkIn: new Date('2026-05-10'), checkOut: new Date('2026-05-12') },
        { name: 'Takayama Ouan Onsen Hotel', dateRange: '12-14 May 2026', costThb: 4900.00, checkIn: new Date('2026-05-12'), checkOut: new Date('2026-05-14') },
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

      await prisma.passBooking.create({
        data: {
          tripId: trip.id,
          name: 'Alpine-Takayama-Matsumoto Area Tourist Pass (5 Days)',
          costJpy: 23800,
          validDays: 5,
          notes: 'Full access to Tateyama Kurobe Alpine Route transit, JR lines between Nagoya, Takayama, Toyama and Matsumoto.',
        },
      });

      await prisma.flightBooking.create({
        data: {
          tripId: trip.id,
          flightNo: 'JL738 / JL737',
          route: 'BKK <-> NGO (Centrair)',
          costThb: 18900,
          notes: 'Japan Airlines direct flight BKK to Nagoya Centrair.',
        },
      });

      const budgets = [
        { category: 'IC Card (Manaca / Suica)', amountJpy: 10000, amountThb: 2400 },
        { category: 'Cash / Pocket Money (เงินสด)', amountJpy: 45000, amountThb: 10800 },
        { category: 'Travel Card (Wise / YouTrip)', amountJpy: 40000, amountThb: 9600 },
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

    const daySheetNames = wb.SheetNames.filter(name => name.startsWith('day-'));
    let dayNum = 1;
    for (const name of daySheetNames) {
      const sheet = wb.Sheets[name];
      if (!sheet) continue;

      const dateObj = new Date('2026-05-08T00:00:00Z');
      dateObj.setDate(dateObj.getDate() + (dayNum - 1));

      const tripDay = await prisma.tripDay.create({
        data: {
          tripId: trip.id,
          dayNumber: dayNum,
          date: dateObj,
          dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()],
          slug: name,
          title: `Day ${dayNum} - ${name.replace('day-', '').replace(/-/g, ' ').toUpperCase()}`,
        },
      });

      const rows = XLSX.utils.sheet_to_json(sheet, { header: 'A', range: 3 });
      let order = 0;
      for (const row of rows) {
        const activityText = cleanText(row.C);
        if (!activityText || activityText.toLowerCase() === 'summary' || activityText.toLowerCase() === 'total') continue;

        await prisma.dayActivity.create({
          data: {
            dayId: tripDay.id,
            time: formatExcelTime(row.A),
            location: cleanText(row.B) || 'Location',
            activity: activityText,
            cost: Number(row.D) || 0,
            isIcCard: row.E === 1 || row.E === '1' || row.E === true,
            usingPass: cleanText(row.F) || null,
            remark: cleanText(row.G) || null,
            sortOrder: order++,
          },
        });
      }
      console.log(`  - Migrated ${name}`);
      dayNum++;
    }
  }

  console.log('\n🎉 ALL TRIPS SUCCESSFULLY MIGRATED TO VERCEL POSTGRES!');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
