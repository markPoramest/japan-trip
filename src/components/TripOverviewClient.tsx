"use client";

import { useState } from "react";
import Link from "next/link";
import TripStats from "@/components/TripStats";
import DayCard from "@/components/DayCard";
import HotelTable from "@/components/HotelTable";
import PassCard from "@/components/PassCard";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import EditTripModal from "@/components/EditTripModal";
import { Sparkles, Calendar, MapPin, Edit3, Printer } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TripData {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  exchangeRate: number;
  totalActivitiesCostJpy: number;
  totalIcSpendJpy: number;
  totalNonIcSpendJpy: number;
  totalHotelThb: number;
  totalHotelJpy: number;
  totalPassJpy: number;
  totalFlightThb: number;
  days: {
    id: string;
    dayNumber: number;
    date: Date;
    dayOfWeek: string;
    slug: string;
    title: string;
    activities: {
      id: string;
      time: string;
      location: string;
      activity: string;
      cost: number;
      isIcCard: boolean;
      usingPass: string | null;
    }[];
  }[];
  hotels: any[];
  passes: any[];
  flights: any[];
  budgets: any[];
}

export default function TripOverviewClient({ trip }: { trip: TripData }) {
  const { t, language } = useLanguage();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dateLocale = language === "th" ? "th-TH" : "en-GB";

  const startStr = new Date(trip.startDate).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" });
  const endStr = new Date(trip.endDate).toLocaleDateString(dateLocale, { day: "numeric", month: "short", year: "numeric" });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
      {/* Hero banner with AOS */}
      <div data-aos="fade-down" className="relative overflow-hidden rounded-3xl bg-card-gradient border border-border p-6 sm:p-10 shadow-earth">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> {t("japanTripPlanner")}
            </div>

            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-surface hover:bg-accent hover:text-white border border-border text-text-secondary text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{t("tripDetails")}</span>
            </button>

            <Link
              href={`/trips/${trip.id}/export`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/15 hover:bg-accent text-accent hover:text-white border border-accent/30 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t("exportPdf")}</span>
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            {trip.title}
          </h1>
          {trip.description && (
            <p className="text-text-secondary mt-2 leading-relaxed text-sm sm:text-base">{trip.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-5 text-xs text-text-muted">
            <span className="flex items-center gap-1.5 bg-bg-surface px-3 py-1.5 rounded-xl border border-border">
              <Calendar className="w-4 h-4 text-accent/70" /> {startStr} – {endStr}
            </span>
            <span className="flex items-center gap-1.5 bg-bg-surface px-3 py-1.5 rounded-xl border border-border">
              <MapPin className="w-4 h-4 text-accent/70" /> {trip.days.length} {t("daysPlanned")}
            </span>
          </div>
        </div>
        <div className="absolute right-6 top-6 hidden sm:block">
          <img
            src="/logo.png"
            alt="Japan Trip Planner"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-lg opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      {/* Financial Summary with AOS */}
      <section className="space-y-3" data-aos="fade-up">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">{t("financialSummary")}</h2>
          <Link href={`/trips/${trip.id}/summary`} className="text-xs text-accent hover:text-accent-light font-semibold">
            {t("viewFullMatrix")}
          </Link>
        </div>
        <TripStats
          totalActivitiesCostJpy={trip.totalActivitiesCostJpy}
          totalIcSpendJpy={trip.totalIcSpendJpy}
          totalNonIcSpendJpy={trip.totalNonIcSpendJpy}
          totalHotelThb={trip.totalHotelThb}
          totalHotelJpy={trip.totalHotelJpy}
          totalPassJpy={trip.totalPassJpy}
          totalFlightThb={trip.totalFlightThb}
          exchangeRate={trip.exchangeRate}
        />
      </section>

      {/* Daily Itineraries Grid with AOS */}
      {trip.days.length > 0 && (
        <section className="space-y-4" data-aos="fade-up">
          <h2 className="text-xl font-bold text-text-primary">{t("days")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trip.days.map((day, idx) => (
              <DayCard key={day.id} day={day} tripId={trip.id} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Budget Allocations with AOS */}
      <div data-aos="fade-up">
        <BudgetBreakdown
          tripId={trip.id}
          budgets={trip.budgets}
          totalIcSpentJpy={trip.totalIcSpendJpy}
          totalNonIcSpentJpy={trip.totalNonIcSpendJpy}
          exchangeRate={trip.exchangeRate}
        />
      </div>

      {/* Hotels, Passes & Flights with AOS */}
      <section className="space-y-6" data-aos="fade-up">
        <HotelTable tripId={trip.id} hotels={trip.hotels} exchangeRate={trip.exchangeRate} />
        <PassCard tripId={trip.id} passes={trip.passes} flights={trip.flights} exchangeRate={trip.exchangeRate} />
      </section>

      {/* Edit Trip Modal */}
      <EditTripModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        trip={{
          id: trip.id,
          title: trip.title,
          description: trip.description,
          startDate: trip.startDate,
          endDate: trip.endDate,
          exchangeRate: trip.exchangeRate,
        }}
      />
    </main>
  );
}
