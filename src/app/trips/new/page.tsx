"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip, createTripDay, createPass } from "@/lib/actions";
import { ArrowLeft, PlusCircle, Trash2, Calendar, Globe, MapPin, Train } from "lucide-react";
import Link from "next/link";
import SettingsKebab from "@/components/SettingsKebab";
import { useLanguage } from "@/context/LanguageContext";

interface DayEntry {
  date: string;
  title: string;
}

interface PassEntry {
  name: string;
  costJpy: string;
  validDays: string;
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [exchangeRate, setExchangeRate] = useState("0.24");
  const [currency, setCurrency] = useState("JPY");
  const [baseCurrency, setBaseCurrency] = useState("THB");
  const [days, setDays] = useState<DayEntry[]>([{ date: "", title: "" }]);
  const [passes, setPasses] = useState<PassEntry[]>([]);

  function addDay() {
    setDays((prev) => [...prev, { date: "", title: "" }]);
  }

  function removeDay(i: number) {
    setDays((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateDay(i: number, field: keyof DayEntry, value: string) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d)));
  }

  function addPass() {
    setPasses((prev) => [...prev, { name: "", costJpy: "", validDays: "" }]);
  }

  function removePass(i: number) {
    setPasses((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updatePass(i: number, field: keyof PassEntry, value: string) {
    setPasses((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function buildSlug(dayNumber: number, title: string) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30)
      .replace(/-$/, "");
    return `day-${dayNumber}-${slug || "day"}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;
    setLoading(true);

    try {
      const trip = await createTrip({
        title,
        startDate,
        endDate,
        description,
        currency,
        baseCurrency,
        exchangeRate: parseFloat(exchangeRate) || 0.24,
      });

      // Create each day
      const validDays = days.filter((d) => d.date && d.title);
      for (let i = 0; i < validDays.length; i++) {
        const d = validDays[i];
        const dateObj = new Date(d.date);
        await createTripDay({
          tripId: trip.id,
          dayNumber: i + 1,
          date: d.date,
          dayOfWeek: DOW[dateObj.getDay()],
          slug: buildSlug(i + 1, d.title),
          title: d.title,
        });
      }

      // Create any passes configured
      const validPasses = passes.filter((p) => p.name.trim());
      for (const p of validPasses) {
        await createPass(trip.id, {
          name: p.name.trim(),
          costJpy: parseFloat(p.costJpy) || 0,
          validDays: parseInt(p.validDays) || undefined,
        });
      }

      router.push(`/trips/${trip.id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create trip. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5";
  const inputClass =
    "w-full px-3.5 py-2.5 bg-bg-base border border-border rounded-xl text-text-primary text-sm placeholder-text-faint focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="min-h-screen bg-bg-base pb-20">
      {/* Header */}
      <header className="border-b border-border bg-bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/trips"
            className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("allTrips")}
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center text-base shadow-accent text-white">
                🗾
              </div>
              <span className="text-sm font-bold text-text-primary">{t("planNewTrip")}</span>
            </div>
            <SettingsKebab />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider mb-3">
            <Globe className="w-3.5 h-3.5" /> {t("newTripBadge")}
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary">{t("planNewJapanTrip")}</h1>
          <p className="text-text-muted mt-1.5">{t("newTripSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Basics */}
          <div className="bg-bg-card border border-border rounded-3xl p-6 shadow-card space-y-5">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" /> {t("tripDetails")}
            </h2>

            <div>
              <label className={labelClass}>{t("tripTitleRequired")}</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kyoto & Osaka Spring 2027"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>{t("description")}</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short summary of your trip theme, regions, or goals..."
                className={inputClass + " resize-none"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("startDateRequired")}</label>
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("endDateRequired")}</label>
                <input
                  required
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Currency & Budget */}
          <div className="bg-bg-card border border-border rounded-3xl p-6 shadow-card space-y-5">
            <h2 className="text-base font-bold text-text-primary">{t("currencySettings")}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>{t("tripCurrency")}</label>
                <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("baseCurrency")}</label>
                <input type="text" value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("exchangeRate")}</label>
                <input
                  type="number"
                  step="0.001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder="0.24"
                  className={inputClass}
                />
                <p className="text-[10px] text-text-faint mt-1">{t("exchangeRateHint")}</p>
              </div>
            </div>
          </div>

          {/* Rail Passes Setup */}
          <div className="bg-bg-card border border-border rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Train className="w-4 h-4 text-olive" /> {t("railPassesSetup")}
              </h2>
              <span className="text-xs text-text-muted">
                {passes.length} {passes.length === 1 ? "pass" : "passes"}
              </span>
            </div>

            <div className="space-y-3">
              {passes.map((pass, i) => (
                <div key={i} className="flex items-center gap-3 bg-bg-surface rounded-2xl p-3 border border-border/60">
                  <input
                    type="text"
                    value={pass.name}
                    onChange={(e) => updatePass(i, "name", e.target.value)}
                    placeholder={t("passNamePlaceholder")}
                    className="flex-1 px-3 py-2 bg-bg-base border border-border rounded-xl text-text-primary text-xs focus:outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    value={pass.costJpy}
                    onChange={(e) => updatePass(i, "costJpy", e.target.value)}
                    placeholder={t("passCostJpy")}
                    className="w-32 px-3 py-2 bg-bg-base border border-border rounded-xl text-text-primary text-xs focus:outline-none focus:border-accent font-mono"
                  />
                  <input
                    type="number"
                    value={pass.validDays}
                    onChange={(e) => updatePass(i, "validDays", e.target.value)}
                    placeholder={t("validDays")}
                    className="w-24 px-3 py-2 bg-bg-base border border-border rounded-xl text-text-primary text-xs focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => removePass(i)}
                    className="p-1.5 rounded-lg text-text-faint hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addPass}
              className="w-full py-2.5 rounded-2xl border border-dashed border-border text-text-muted hover:border-olive hover:text-olive text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> {t("addPass")}
            </button>
          </div>

          {/* Days Setup */}
          <div className="bg-bg-card border border-border rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> {t("dailySchedule")}
              </h2>
              <span className="text-xs text-text-muted">
                {days.length} {t("days")} {t("daysCountHint")}
              </span>
            </div>

            <div className="space-y-3">
              {days.map((day, i) => (
                <div key={i} className="flex items-center gap-3 bg-bg-surface rounded-2xl p-3 border border-border/60">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <input
                    type="date"
                    value={day.date}
                    onChange={(e) => updateDay(i, "date", e.target.value)}
                    className="flex-shrink-0 px-3 py-2 bg-bg-base border border-border rounded-xl text-text-primary text-xs focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => updateDay(i, "title", e.target.value)}
                    placeholder={t("dayDestinationPlaceholder", { num: i + 1 })}
                    className="flex-1 px-3 py-2 bg-bg-base border border-border rounded-xl text-text-primary text-xs focus:outline-none focus:border-accent placeholder-text-faint"
                  />
                  {days.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDay(i)}
                      className="p-1.5 rounded-lg text-text-faint hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addDay}
              className="w-full py-2.5 rounded-2xl border border-dashed border-border text-text-muted hover:border-accent hover:text-accent text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> {t("addDay")}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/trips"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text-primary hover:bg-bg-card transition-colors"
            >
              {t("cancel")}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white text-sm font-bold shadow-accent transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? t("creating") : t("createTrip")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
