"use client";

import HotelTable from "@/components/HotelTable";
import PassCard from "@/components/PassCard";
import BudgetBreakdown from "@/components/BudgetBreakdown";
import { useLanguage } from "@/context/LanguageContext";

interface BookingsClientProps {
  trip: {
    id: string;
    startDate?: string | Date;
    endDate?: string | Date;
    exchangeRate: number;
    hotels: any[];
    passes: any[];
    flights: any[];
    budgets: any[];
  };
  totalIcSpendJpy: number;
  totalNonIcSpendJpy: number;
}

export default function BookingsClient({ trip, totalIcSpendJpy, totalNonIcSpendJpy }: BookingsClientProps) {
  const { t } = useLanguage();

  const startStr = trip.startDate ? (typeof trip.startDate === "string" ? trip.startDate : trip.startDate.toISOString()) : undefined;
  const endStr = trip.endDate ? (typeof trip.endDate === "string" ? trip.endDate : trip.endDate.toISOString()) : undefined;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div data-aos="fade-down">
        <h1 className="text-3xl font-extrabold text-text-primary">{t("hotelsPassesBudgets")}</h1>
        <p className="text-sm text-text-muted mt-1">{t("bookingsSubtitle")}</p>
      </div>

      <div data-aos="fade-up">
        <HotelTable
          tripId={trip.id}
          hotels={trip.hotels}
          exchangeRate={trip.exchangeRate}
          tripStartDate={startStr}
          tripEndDate={endStr}
        />
      </div>

      <div data-aos="fade-up" data-aos-delay="100">
        <PassCard tripId={trip.id} passes={trip.passes} flights={trip.flights} exchangeRate={trip.exchangeRate} />
      </div>

      <div data-aos="fade-up" data-aos-delay="200">
        <BudgetBreakdown
          tripId={trip.id}
          budgets={trip.budgets}
          totalIcSpentJpy={totalIcSpendJpy}
          totalNonIcSpentJpy={totalNonIcSpendJpy}
          exchangeRate={trip.exchangeRate}
        />
      </div>
    </main>
  );
}
