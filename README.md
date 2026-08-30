# 🗾 Japan Trip Planner & Cost Manager

An interactive, responsive web application for planning Japan travel itineraries, tracking daily transit and IC card expenses, managing hotel/flight/rail pass bookings, and auto-calculating budgets with live **JPY (¥) ⇄ THB (฿)** currency conversions.

---

## ✨ Features

- 📅 **Multi-Trip Itinerary Management**:
  - Organize upcoming and past trips with dates, duration, and financial summaries.
  - Fully clickable trip & day cards with instant spinner feedback and top glowing progress bars.
- 🕒 **Daily Timeline Schedule**:
  - Hourly timeline with precise time selection, locations, activity notes, and URLs.
  - Track **IC Card** vs. **Cash / Credit Card** spending for every stop.
  - Link activities to regional transit passes (e.g., JR East-South Hokkaido Rail Pass).
- 💳 **Cost Handle (Hotels, Passes, Flights & Budgets)**:
  - **Hotel Bookings**: Date ranges, booking references, and dual currency costs.
  - **Rail & Transit Passes**: Regional and Shinkansen passes with validity tracking.
  - **Flights**: International and domestic airfare details.
  - **Pocket Budget Allocation**: Manage discrete budget wallets (IC Card, Cash, Travel Cards).
- 📊 **Excel Summary Matrix**:
  - Live 5-table spreadsheet view breaking down:
    1. Daily Expenses (Non-IC vs IC Card vs Total)
    2. Hotel Stays (THB & JPY)
    3. Flights (THB & JPY)
    4. Rail & Transit Passes (JPY & THB)
    5. Pocket Budget Allocation
- 🖨️ **Immigration & On-Trip PDF Export**:
  - Clean, print-friendly travel schedule designed for immigration review and offline travel reference.
- 🌐 **Bilingual Support & Dark/Light Mode**:
  - Seamless toggle between **English (EN)** and **ภาษาไทย (TH)**.
  - Dark mode by default with light mode toggle and persistent local storage preferences.
- 🎬 **AOS (Animate On Scroll)**:
  - Smooth cascading entrance and scroll animations configured globally across all pages.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd japan-trip
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Setup Database & Seed Data
```bash
# Push Prisma schema to SQLite database
pnpm run db:push

# (Optional) Seed sample trips
pnpm run db:seed
```

### 4. Run Development Server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Starts the Next.js development server |
| `pnpm run build` | Generates Prisma client and creates production build |
| `pnpm run start` | Starts the production server |
| `pnpm run db:push` | Pushes Prisma schema changes to SQLite |
| `pnpm run db:seed` | Seeds database with initial trip data |
| `pnpm run db:studio` | Opens Prisma Studio GUI to view/edit database records |

---

## 📄 License

MIT License © 2026
