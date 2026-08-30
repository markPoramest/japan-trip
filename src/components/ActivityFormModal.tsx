"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createActivity, updateActivity } from "@/lib/actions";
import { X, Clock, MapPin, AlignLeft, CreditCard, Train, Link as LinkIcon, CircleDollarSign, ArrowRightLeft, Loader2, Sparkles } from "lucide-react";
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

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const TIME_PRESETS = ["08:00", "09:30", "12:00", "14:00", "18:00", "20:00"];

export default function ActivityFormModal({
  isOpen,
  onClose,
  dayId,
  exchangeRate = 0.24,
  availablePasses = [],
  activity,
}: ActivityModalProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEditing = !!activity;

  const [mounted, setMounted] = useState(false);
  const [selectedHour, setSelectedHour] = useState("09");
  const [selectedMinute, setSelectedMinute] = useState("00");
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activity && isOpen) {
      const rawTime = activity.time || "09:00";
      const parts = rawTime.split(":");
      const h = parts[0]?.padStart(2, "0") || "09";
      const m = parts[1]?.padStart(2, "0") || "00";
      setSelectedHour(HOURS.includes(h) ? h : "09");
      setSelectedMinute(MINUTES.includes(m) ? m : "00");

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
      setSelectedHour("09");
      setSelectedMinute("00");
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

  if (!isOpen || !mounted) return null;

  const time = `${selectedHour}:${selectedMinute}`;
  const numVal = parseFloat(amountValue) || 0;
  const jpyVal = inputCurrency === "JPY" ? numVal : exchangeRate > 0 ? Math.round(numVal / exchangeRate) : 0;
  const thbVal = inputCurrency === "THB" ? numVal : Math.round(numVal * exchangeRate);

  const resolvedPass = isCustomMode ? customPass.trim() || null : selectedPass || null;

  const handleQuickTime = (preset: string) => {
    const [h, m] = preset.split(":");
    setSelectedHour(h);
    setSelectedMinute(m);
  };

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
      router.refresh();
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

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span>{isEditing ? t("editStopActivity") : t("addStopActivity")}</span>
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            type="button"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Time Picker & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {/* Time Picker (Hour : Minute Dropdown) */}
            <div className="sm:col-span-2">
              <label className={labelClass}>
                <Clock className="w-3.5 h-3.5 text-accent" /> {t("time")}
              </label>
              
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <select
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-bg-base border border-border rounded-xl text-center text-sm font-mono font-bold text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="font-bold text-text-muted font-mono text-base">:</span>
                <div className="flex-1">
                  <select
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-bg-base border border-border rounded-xl text-center text-sm font-mono font-bold text-text-primary focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Time Presets */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {TIME_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleQuickTime(p)}
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                      time === p
                        ? "bg-accent text-white border-accent shadow-sm"
                        : "bg-bg-base text-text-muted border-border hover:border-accent/50 hover:text-text-primary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="sm:col-span-3">
              <label className={labelClass}>
                <MapPin className="w-3.5 h-3.5 text-accent" /> {t("locationPlace")} *
              </label>
              <input
                required
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Asakusa Sensoji Temple"
                className={inputClass}
              />
            </div>
          </div>

          {/* Activity Description */}
          <div>
            <label className={labelClass}>
              <AlignLeft className="w-3.5 h-3.5 text-text-faint" /> {t("activityDetails")} *
            </label>
            <textarea
              required
              rows={2}
              value={actText}
              onChange={(e) => setActText(e.target.value)}
              placeholder="e.g. Walk Nakamise street, eat melon pan..."
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Currency selection & Cost input */}
          <div className="p-3.5 bg-bg-surface border border-border rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                {language === "th" ? "เลือกสกุลเงิน & ค่าใช้จ่าย" : "Currency & Cost"}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={inputCurrency}
                  onChange={(e) => setInputCurrency(e.target.value as "JPY" | "THB")}
                  className="px-2.5 py-1 bg-bg-base border border-border rounded-lg text-xs font-bold text-accent focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="JPY">JPY (¥ เยน)</option>
                  <option value="THB">THB (฿ บาท)</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                placeholder={inputCurrency === "JPY" ? "0 or e.g. 1500" : "0 or e.g. 360"}
                className={`${inputClass} font-mono text-base font-bold`}
              />
            </div>

            {/* Live Dual Currency Conversion Display */}
            {numVal > 0 && (
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-accent" />
                  <span>{language === "th" ? "เทียบเท่า" : "Equivalent to"}:</span>
                </span>
                <div className="font-mono font-bold text-right">
                  <span className="text-accent">{formatJPY(jpyVal)}</span>
                  <span className="text-text-faint mx-1.5">≈</span>
                  <span className="text-text-primary">{formatTHB(thbVal)}</span>
                </div>
              </div>
            )}

            {/* IC Card toggle */}
            <div className="pt-2 border-t border-border/60">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isIcCard}
                  onChange={(e) => setIsIcCard(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-sage focus:ring-sage accent-sage"
                />
                <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-sage" />
                  <span>{t("icCard")} (Suica / Pasmo / ICOCA)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Transit Pass Selector */}
          <div>
            <label className={labelClass}>
              <Train className="w-3.5 h-3.5 text-olive" /> {t("railPassUsed")}
            </label>
            <select
              value={isCustomMode ? "__custom__" : selectedPass}
              onChange={(e) => handlePassSelectChange(e.target.value)}
              className={inputClass}
            >
              <option value="">{t("noPassUsed")}</option>
              {availablePasses.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="__custom__">{t("otherCustomPass")}</option>
            </select>

            {isCustomMode && (
              <input
                type="text"
                value={customPass}
                onChange={(e) => setCustomPass(e.target.value)}
                placeholder={t("enterCustomPass")}
                className={inputClass + " mt-2"}
              />
            )}
          </div>

          {/* Remarks / Link */}
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
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors disabled:opacity-50 cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold shadow-accent transition-all hover:scale-105 disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? (language === "th" ? "กำลังบันทึก..." : "Saving...") : isEditing ? t("saveChanges") : t("addActivity")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
