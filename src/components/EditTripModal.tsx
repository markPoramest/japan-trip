"use client";

import { useState, useEffect } from "react";
import { updateTrip } from "@/lib/actions";
import { X, Calendar, MapPin, AlignLeft, JapaneseYen, Edit3 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate: string;
    exchangeRate: number;
    currency?: string;
    baseCurrency?: string;
  };
}

export default function EditTripModal({ isOpen, onClose, trip }: EditTripModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(trip.title);
  const [description, setDescription] = useState(trip.description || "");
  const [startDate, setStartDate] = useState(trip.startDate.split("T")[0]);
  const [endDate, setEndDate] = useState(trip.endDate.split("T")[0]);
  const [exchangeRate, setExchangeRate] = useState(trip.exchangeRate.toString());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(trip.title);
      setDescription(trip.description || "");
      setStartDate(trip.startDate.split("T")[0]);
      setEndDate(trip.endDate.split("T")[0]);
      setExchangeRate(trip.exchangeRate.toString());
    }
  }, [isOpen, trip]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;
    setLoading(true);

    try {
      await updateTrip(trip.id, {
        title,
        description,
        startDate,
        endDate,
        exchangeRate: parseFloat(exchangeRate) || 0.24,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update trip details.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3.5 py-2.5 bg-bg-base border border-border rounded-xl text-text-primary text-sm placeholder-text-faint focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-accent" /> {t("tripDetails")}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>
              <MapPin className="w-3.5 h-3.5 text-accent" /> {t("tripTitleRequired")}
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>
              <AlignLeft className="w-3.5 h-3.5 text-text-faint" /> {t("description")}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of regions, seasons, or goals..."
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Calendar className="w-3.5 h-3.5 text-accent/70" /> {t("startDateRequired")}
              </label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                <Calendar className="w-3.5 h-3.5 text-accent/70" /> {t("endDateRequired")}
              </label>
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Exchange rate */}
          <div className="p-3.5 bg-bg-surface border border-border rounded-2xl">
            <label className={labelClass}>
              <JapaneseYen className="w-3.5 h-3.5 text-sand" /> {t("exchangeRate")} (JPY ➔ THB)
            </label>
            <input
              type="number"
              step="0.001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="0.24"
              className={inputClass}
            />
            <p className="text-[10px] text-text-faint mt-1.5">{t("exchangeRateHint")}</p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold shadow-accent transition-all hover:scale-105 disabled:opacity-60"
            >
              {loading ? t("creating") : t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
