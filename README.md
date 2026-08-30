<div align="center">

<img src="public/logo.png" alt="Japan Trip Planner — By Mark no Nihon Tabi" width="200" />

# 🗾 Japan Trip Planner
### *By Mark no Nihon Tabi*

An interactive, responsive web application for planning Japan travel itineraries, tracking daily transit and IC card expenses, managing hotel/flight/rail pass bookings, and auto-calculating budgets with live **JPY (¥) ⇄ THB (฿)** currency conversions.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-mark--no--nihon--tabi.vercel.app-ff6b6b?style=for-the-badge&logo=vercel)](https://japantripplanner.vercel.app)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Vercel Postgres](https://img.shields.io/badge/Database-Vercel_Postgres-00e599?style=for-the-badge&logo=postgresql)](https://vercel.com/storage/postgres)
[![Google OAuth](https://img.shields.io/badge/Auth-Google_OAuth-4285f4?style=for-the-badge&logo=google)](https://next-auth.js.org)

🌐 **Production Website**: **[https://japantripplanner.vercel.app](https://japantripplanner.vercel.app)**

</div>

---

## ✨ Features

- 🔒 **100% Private Per-User Database Isolation**:
  - Sign in with **Google OAuth (SSO)**.
  - Every user has their own private workspace; itineraries and budgets belong only to you.
- 📅 **Multi-Trip Itinerary Management**:
  - Organize upcoming and past trips with dates, duration, and financial summaries.
  - Fully clickable trip & day cards with instant spinner feedback and top glowing progress bars.
- 🕒 **Daily Timeline Schedule**:
  - Hourly timeline with precise time selection, locations, activity notes, and URLs.
  - Track **IC Card** vs. **Cash / Credit Card** spending for every stop.
  - Link activities to regional transit passes (e.g., JR East-South Hokkaido Rail Pass).
- 💳 **Cost Management (Hotels, Passes, Flights & Budgets)**:
  - **Hotel Bookings**: Date ranges, booking references, and dual currency costs (THB & JPY).
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
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with Google OAuth & Prisma Adapter
- **Database & ORM**: [Vercel Postgres](https://vercel.com/storage/postgres) (PostgreSQL) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/markPoramest/japan-trip-planner.git
cd japan-trip-planner
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Variables Setup
Create a `.env` file in the root directory (copy from `.env.example`):
```env
POSTGRES_PRISMA_URL="postgresql://user:password@host/neondb?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host/neondb?sslmode=require"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Push Database Schema
```bash
pnpm run db:push
```

### 5. Run Development Server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Starts the Next.js development server |
| `pnpm run build` | Generates Prisma client, pushes migrations, and creates production build |
| `pnpm run start` | Starts the production server |
| `pnpm run db:push` | Pushes Prisma schema changes to Vercel Postgres |
| `pnpm run db:studio` | Opens Prisma Studio GUI to view/edit database records |

---

## 📄 License

MIT License © 2026 Mark no Nihon Tabi. All rights reserved.
