"use client";

import { useState, useEffect } from "react";
import { createPass, updatePass } from "@/lib/actions";
import { X, Train, Calendar, FileText, ArrowRightLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatJPY, formatTHB } from "@/lib/utils";

interface PassBooking {
  id: string;
  name: string;
  costJpy: number | null;
  costThb: number | null;
  validDays: number | null;
  notes: string | null;
}

interface PassModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  exchangeRate?: number;
  pass?: PassBooking | null;
}

export default function PassModal({
  isOpen,
  onClose,
  tripId,
  exchangeRate = 0.24,
  pass,
}: PassModalProps) {
  const { t, language } = useLanguage();
  const isEditing = !!pass;

  const [name, setName] = useState("");
  const [inputCurrency, setInputCurrency] = useState<"JPY" | "THB">("JPY");
  const [amountValue, setAmountValue] = useState("");
  const [validDays, setValidDays] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pass && isOpen) {
      setName(pass.name || "");
      if (pass.costJpy) {
        setInputCurrency("JPY");
        setAmountValue(pass.costJpy.toString());
      } else if (pass.costThb) {
        setInputCurrency("THB");
        setAmountValue(pass.costThb.toString());
      } else {
        setAmountValue("");
      }
      setValidDays(pass.validDays !== null && pass.validDays !== undefined ? pass.validDays.toString() : "");
      setNotes(pass.notes || "");
    } else if (!pass && isOpen) {
      setName("");
      setInputCurrency("JPY");
      setAmountValue("");
      setValidDays("");
      setNotes("");
    }
  }, [pass, isOpen]);

  if (!isOpen) return null;

  const numVal = parseFloat(amountValue) || 0;
  const jpyVal = inputCurrency === "JPY" ? numVal : exchangeRate > 0 ? Math.round(numVal / exchangeRate) : 0;
  const thbVal = inputCurrency === "THB" ? numVal : Math.round(numVal * exchangeRate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      if (isEditing && pass) {
        await updatePass(pass.id, {
          name: name.trim(),
          costJpy: jpyVal || 0,
          notes: notes.trim() || undefined,
        });
      } else {
        await createPass(tripId, {
          name: name.trim(),
          costJpy: jpyVal || 0,
          validDays: parseInt(validDays) || undefined,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save transit pass.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 bg-bg-base border border-border rounded-xl text-text-primary text-sm placeholder-text-faint focus:outline-none focus:border-accent transition-colors";
  const labelClass = "block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Train className="w-4 h-4 text-olive" />
            <span>{isEditing ? t("editPass") : t("addPass")}</span>
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
          <div>
            <label className={labelClass}>
              <Train className="w-3.5 h-3.5 text-olive" /> {t("passNamePlaceholder")} *
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. JR East-South Hokkaido Rail Pass"
              className={inputClass}
            />
          </div>

          {/* Currency selection & Amount */}
          <div className="p-3.5 bg-bg-surface border border-border rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                {language === "th" ? "เลือกสกุลเงิน & ราคาพาส" : "Currency & Pass Cost"}
              </label>
              <select
                value={inputCurrency}
                onChange={(e) => setInputCurrency(e.target.value as "JPY" | "THB")}
                className="px-2.5 py-1 bg-bg-base border border-border rounded-lg text-xs font-bold text-accent focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="JPY">JPY (¥ เยน)</option>
                <option value="THB">THB (฿ บาท)</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="number"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                placeholder={inputCurrency === "JPY" ? "¥ 35,000" : "฿ 8,400"}
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
                  <span className="text-text-primary">{formatJPY(jpyVal)}</span>
                  <span className="text-text-faint mx-1.5">≈</span>
                  <span className="text-accent">{formatTHB(thbVal)}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>
              <Calendar className="w-3.5 h-3.5 text-accent" /> {t("validDays")}
            </label>
            <input
              type="number"
              value={validDays}
              onChange={(e) => setValidDays(e.target.value)}
              placeholder="e.g. 6"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              <FileText className="w-3.5 h-3.5 text-text-faint" /> {t("remarksLinks")}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Reserved seating included, valid from Tokyo to Sapporo"
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
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold shadow-accent transition-all hover:scale-105 disabled:opacity-60 cursor-pointer"
            >
              {loading ? t("creating") : isEditing ? t("saveChanges") : t("addPass")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
