"use client";

import { useState } from "react";
import Link from "next/link";
import { formatJPY } from "@/lib/utils";
import { Calendar, CreditCard, Banknote, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface DayCardProps {
  tripId: string;
  index?: number;
  day: {
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
  };
}

export default function DayCard({ day, tripId, index = 0 }: DayCardProps) {
  const { t, language } = useLanguage();
  const [navigating, setNavigating] = useState(false);

  const totalCost = day.activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  const icCost = day.activities.filter((a) => a.isIcCard).reduce((sum, a) => sum + (a.cost || 0), 0);
  const nonIcCost = totalCost - icCost;

  const topLocations = Array.from(new Set(day.activities.map((a) => a.location)))
    .filter((loc) => loc && loc.toLowerCase() !== "location")
    .slice(0, 3);

  const dateLocale = language === "th" ? "th-TH" : "en-GB";
  const formattedDate = new Date(day.date).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
  });

  return (
    <Link
      href={`/trips/${tripId}/days/${day.slug}`}
      onClick={() => setNavigating(true)}
      data-aos="fade-up"
      data-aos-delay={(index % 6) * 80}
      className="bg-bg-card border border-border rounded-3xl p-5 hover:border-accent hover:shadow-earth transition-all flex flex-col justify-between group shadow-card cursor-pointer block select-none"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20 text-xs font-bold uppercase tracking-wider">
              {t("day")} {day.dayNumber}
            </span>
            <span className="text-xs text-text-muted flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-accent/70" />
              {formattedDate} ({day.dayOfWeek})
            </span>
          </div>
          <span className="text-xs font-medium text-text-faint bg-bg-surface px-2 py-0.5 rounded-full border border-border/60">
            {day.activities.length} {t("stops")}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-text-primary mt-3 group-hover:text-accent transition-colors leading-snug">
          {day.title}
        </h3>

        {/* Location pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {topLocations.map((loc, i) => (
            <span
              key={i}
              className="text-[11px] text-text-secondary bg-bg-surface px-2 py-1 rounded-md flex items-center gap-1 border border-border/60"
            >
              <MapPin className="w-3 h-3 text-accent/70" />
              <span className="truncate max-w-[150px]">{loc}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="mt-5 pt-4 border-t border-border/60">
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="p-2 rounded-xl bg-sage-subtle border border-sage-muted">
            <div className="text-text-muted flex items-center gap-1 text-[11px]">
              <CreditCard className="w-3 h-3 text-sage" /> {t("icCardOnly")}
            </div>
            <div className="font-semibold text-sage mt-0.5 font-mono">{formatJPY(icCost)}</div>
          </div>
          <div className="p-2 rounded-xl bg-sand-subtle border border-sand-muted">
            <div className="text-text-muted flex items-center gap-1 text-[11px]">
              <Banknote className="w-3 h-3 text-sand" /> {t("cashAndCredit")}
            </div>
            <div className="font-semibold text-sand mt-0.5 font-mono">{formatJPY(nonIcCost)}</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div>
            <div className="text-[10px] uppercase font-semibold text-text-faint">{t("total")}</div>
            <div className="text-base font-bold text-text-primary font-mono">{formatJPY(totalCost)}</div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-bg-surface border border-border text-text-secondary group-hover:bg-accent group-hover:border-accent group-hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm">
            {navigating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent group-hover:text-white" />
                <span>{language === "th" ? "กำลังโหลด..." : "Loading..."}</span>
              </>
            ) : (
              <>
                <span>{t("viewTimeline")}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
