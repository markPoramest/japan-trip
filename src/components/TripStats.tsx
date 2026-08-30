"use client";

import { formatJPY, formatTHB } from "@/lib/utils";
import { Wallet, Plane, Hotel, CircleDollarSign, Train, Ticket } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TripStatsProps {
  totalActivitiesCostJpy: number;
  totalIcSpendJpy: number;
  totalNonIcSpendJpy: number;
  totalHotelThb: number;
  totalHotelJpy: number;
  totalPassJpy: number;
  totalFlightThb: number;
  exchangeRate: number;
}

export default function TripStats({
  totalActivitiesCostJpy,
  totalIcSpendJpy,
  totalNonIcSpendJpy,
  totalHotelThb,
  totalHotelJpy,
  totalPassJpy,
  totalFlightThb,
  exchangeRate = 0.24,
}: TripStatsProps) {
  const { t } = useLanguage();

  const rate = exchangeRate > 0 ? exchangeRate : 0.24;
  const hotelJpy = totalHotelJpy > 0 ? totalHotelJpy : totalHotelThb / rate;
  const flightJpy = totalFlightThb / rate;
  const fixedExpensesThb = totalHotelThb + totalFlightThb + totalPassJpy * rate;
  const totalTripEstimatedThb = totalActivitiesCostJpy * rate + fixedExpensesThb;
  const totalTripEstimatedJpy = totalActivitiesCostJpy + hotelJpy + totalPassJpy + flightJpy;

  const cards = [
    // 1. Flight
    {
      label: t("flights"),
      value: formatTHB(totalFlightThb),
      sub: `≈ ${formatJPY(flightJpy)}`,
      icon: Plane,
      iconBg: "bg-sage-subtle border-sage-muted text-sage",
      highlight: false,
    },
    // 2. Hotel
    {
      label: t("hotels"),
      value: formatTHB(totalHotelThb),
      sub: `≈ ${formatJPY(hotelJpy)}`,
      icon: Hotel,
      iconBg: "bg-sand-subtle border-sand-muted text-sand",
      highlight: false,
    },
    // 3. Passes, Rentals & Tickets
    {
      label: t("railPasses"),
      value: formatJPY(totalPassJpy),
      sub: `≈ ${formatTHB(totalPassJpy * rate)}`,
      icon: Ticket,
      iconBg: "bg-olive-subtle border-olive-muted text-olive",
      highlight: false,
    },
    // 4. Total Cost Everyday (Activities)
    {
      label: t("totalCostEveryday"),
      value: formatJPY(totalActivitiesCostJpy),
      sub: `≈ ${formatTHB(totalActivitiesCostJpy * rate)}`,
      icon: CircleDollarSign,
      iconBg: "bg-accent/10 border-accent/20 text-accent",
      highlight: false,
    },
    // 5. Grand Total
    {
      label: t("grandTotalEstimated"),
      value: formatTHB(totalTripEstimatedThb),
      sub: `≈ ${formatJPY(totalTripEstimatedJpy)}`,
      icon: Wallet,
      iconBg: "bg-accent/15 border-accent/30 text-accent",
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            data-aos="fade-up"
            data-aos-delay={idx * 80}
            className={`rounded-3xl p-5 shadow-card flex flex-col justify-between transition-all hover:shadow-earth ${
              card.highlight
                ? "bg-gradient-to-br from-accent/10 via-bg-card to-bg-card border-2 border-accent shadow-accent/20 sm:col-span-2 md:col-span-1 lg:col-span-1"
                : "bg-bg-card border border-border hover:border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{card.label}</span>
              <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <div
                className={`text-2xl font-extrabold tracking-tight font-mono ${
                  card.highlight ? "text-accent" : "text-text-primary"
                }`}
              >
                {card.value}
              </div>
              <div className="text-xs text-text-muted mt-1 font-mono">
                {card.sub}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
