"use client";

import { useEffect, useState } from "react";
import { createActivity, updateActivity } from "@/lib/actions";
import { X, Clock, MapPin, AlignLeft, CreditCard, Train, Link as LinkIcon, CircleDollarSign, ArrowRightLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatJPY, formatTHB } from "@/lib/utils";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: string;
  exchangeRate?: number;
  availablePasses?: string[];
  activity?: {
    id: string;
    time: string;
    location: string;
    activity: string;
    cost: number;
    isIcCard: boolean;
    usingPass: string | null;
    remark: string | null;
  } | null;
}

export default function ActivityFormModal({
  isOpen,
  onClose,
  dayId,
  exchangeRate = 0.24,
  availablePasses = [],
  activity,
}: ActivityModalProps) {
  const { t, language } = useLanguage();
  const isEditing = !!activity;
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [actText, setActText] = useState("");
  const [inputCurrency, setInputCurrency] = useState<"JPY" | "THB">("JPY");
  const [amountValue, setAmountValue] = useState("");
  const [isIcCard, setIsIcCard] = useState(false);
  const [selectedPass, setSelectedPass] = useState("");
  const [customPass, setCustomPass] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync form inputs whenever activity or modal open state changes
  useEffect(() => {
    if (activity && isOpen) {
      setTime(activity.time || "");
      setLocation(activity.location || "");
      setActText(activity.activity || "");
      setInputCurrency("JPY");
      setAmountValue(activity.cost !== undefined && activity.cost !== null ? activity.cost.toString() : "");
      setIsIcCard(activity.isIcCard || false);

      const passVal = activity.usingPass || "";
      if (passVal && !availablePasses.includes(passVal)) {
        setIsCustomMode(true);
        setSelectedPass("__custom__");
        setCustomPass(passVal);
      } else {
        setIsCustomMode(false);
        setSelectedPass(passVal);
        setCustomPass("");
      }

      setRemark(activity.remark || "");
    } else if (!activity && isOpen) {
      setTime("");
      setLocation("");
      setActText("");
      setInputCurrency("JPY");
      setAmountValue("");
      setIsIcCard(false);
      setSelectedPass("");
      setCustomPass("");
      setIsCustomMode(false);
      setRemark("");
    }
  }, [activity, isOpen, availablePasses]);

  if (!isOpen) return null;

  const numVal = parseFloat(amountValue) || 0;
  const jpyVal = inputCurrency === "JPY" ? numVal : exchangeRate > 0 ? Math.round(numVal / exchangeRate) : 0;
  const thbVal = inputCurrency === "THB" ? numVal : Math.round(numVal * exchangeRate);

  const resolvedPass = isCustomMode ? customPass.trim() || null : selectedPass || null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && activity) {
        await updateActivity(activity.id, {
          time,
          location,
          activity: actText,
          cost: jpyVal || 0,
          isIcCard,
          usingPass: resolvedPass,
          remark: remark || null,
        });
      } else {
        await createActivity(dayId, {
          time,
          location,
          activity: actText,
          cost: jpyVal || 0,
          isIcCard,
          usingPass: resolvedPass || undefined,
          remark: remark || undefined,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save activity");
    } finally {
      setLoading(false);
    }
  }

  const handlePassSelectChange = (val: string) => {
    setSelectedPass(val);
    if (val === "__custom__") {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 bg-bg-base border border-border rounded-xl text-text-primary text-sm placeholder-text-faint focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">
            {isEditing ? t("editStopActivity") : t("addStopActivity")}
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
          {/* Time & Cost with Currency Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <Clock className="w-3.5 h-3.5 text-accent" /> {t("time")}
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>

            {/* Currency selector + Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                  <CircleDollarSign className="w-3.5 h-3.5 text-sand" /> {t("cost")}
                </label>
                <select
                  value={inputCurrency}
                  onChange={(e) => setInputCurrency(e.target.value as "JPY" | "THB")}
                  className="px-2 py-0.5 bg-bg-base border border-border rounded-md text-[11px] font-bold text-accent focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="JPY">JPY (¥)</option>
                  <option value="THB">THB (฿)</option>
                </select>
              </div>
              <input
                type="number"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                placeholder="0"
                className={`${inputClass} font-mono`}
              />
              {numVal > 0 && (
                <div className="mt-1 text-[11px] text-text-muted font-mono flex items-center gap-1">
                  <ArrowRightLeft className="w-2.5 h-2.5 text-accent" />
                  <span>{inputCurrency === "JPY" ? `≈ ${formatTHB(thbVal)}` : `≈ ${formatJPY(jpyVal)}`}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>
              <MapPin className="w-3.5 h-3.5 text-accent" /> {t("locationPlace")}
            </label>
            <input
              required
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hirosaki Castle, Lucky Pierrot"
              className={inputClass}
            />
          </div>

          {/* Activity / Details */}
          <div>
            <label className={labelClass}>
              <AlignLeft className="w-3.5 h-3.5 text-text-faint" /> {t("activityDetails")}
            </label>
            <textarea
              required
              rows={3}
              value={actText}
              onChange={(e) => setActText(e.target.value)}
              placeholder="Describe the activity, sights, food, or transportation details..."
              className={inputClass + " resize-none"}
            />
          </div>

          {/* 1. SEPARATE SECTION: Pay with IC Card */}
          <div className="p-3.5 bg-bg-surface border border-border rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isIcCard}
                  onChange={(e) => setIsIcCard(e.target.checked)}
                  className="w-4 h-4 rounded text-accent bg-bg-base border-border focus:ring-accent accent-accent"
                />
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-sage" />
                  <span>{t("icCard")}</span>
                </span>
              </label>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold tracking-wider ${
                  isIcCard
                    ? "bg-sage-subtle text-sage border border-sage-muted"
                    : "bg-sand-subtle text-sand border border-sand-muted"
                }`}
              >
                {isIcCard ? "IC CARD" : "CASH / CARD"}
              </span>
            </div>
          </div>

          {/* 2. SEPARATE SECTION: Rail Pass Used (Dropdown Selection) */}
          <div className="p-3.5 bg-bg-surface border border-border rounded-2xl space-y-2">
            <label className="block text-xs font-semibold text-text-primary flex items-center gap-2">
              <Train className="w-4 h-4 text-olive" /> {t("railPassUsed")}
            </label>

            <select
              value={selectedPass}
              onChange={(e) => handlePassSelectChange(e.target.value)}
              className="w-full px-3 py-2 bg-bg-base border border-border rounded-xl text-text-primary text-xs focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              <option value="">{t("noPassUsed")}</option>
              {availablePasses.map((passName) => (
                <option key={passName} value={passName}>
                  🚆 {passName}
                </option>
              ))}
              <option value="__custom__">➕ {t("otherCustomPass")}</option>
            </select>

            {isCustomMode && (
              <input
                type="text"
                value={customPass}
                onChange={(e) => setCustomPass(e.target.value)}
                placeholder={t("enterCustomPass")}
                className="w-full px-3 py-2 bg-bg-base border border-border rounded-xl text-text-primary text-xs focus:outline-none focus:border-accent transition-colors placeholder-text-faint mt-1.5"
              />
            )}
          </div>

          {/* Remarks & Links */}
          <div>
            <label className={labelClass}>
              <LinkIcon className="w-3.5 h-3.5 text-text-faint" /> {t("remarksLinks")}
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Transit timetable URL or notes"
              className={inputClass}
            />
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
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold shadow-accent transition-all hover:scale-105 disabled:opacity-60"
            >
              {loading ? t("creating") : isEditing ? t("saveChanges") : t("addActivity")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
