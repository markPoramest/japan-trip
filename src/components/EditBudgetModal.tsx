"use client";

import { useState, useEffect } from "react";
import { updateBudget, createBudgetWallet, deleteBudgetWallet } from "@/lib/actions";
import { X, Wallet, Plus, Trash2, JapaneseYen, Banknote, Save, ArrowRightLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatJPY, formatTHB } from "@/lib/utils";

interface BudgetWallet {
  id: string;
  category: string;
  amountJpy: number;
  amountThb: number;
  notes: string | null;
}

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  exchangeRate: number;
  budgets: BudgetWallet[];
}

export default function EditBudgetModal({
  isOpen,
  onClose,
  tripId,
  exchangeRate = 0.24,
  budgets,
}: EditBudgetModalProps) {
  const { t, language } = useLanguage();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // New budget wallet inputs
  const [newCategory, setNewCategory] = useState("");
  const [newCurrency, setNewCurrency] = useState<"JPY" | "THB">("JPY");
  const [newAmount, setNewAmount] = useState("");
  const [adding, setAdding] = useState(false);

  // Local state for editing rows
  const [editList, setEditList] = useState<
    { id: string; category: string; amountJpy: string; amountThb: string; notes: string }[]
  >([]);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setEditList(
        budgets.map((b) => ({
          id: b.id,
          category: b.category,
          amountJpy: b.amountJpy.toString(),
          amountThb: b.amountThb.toString(),
          notes: b.notes || "",
        }))
      );
    }
  }, [isOpen, budgets]);

  if (!isOpen) return null;

  const handleJpyChange = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    const calcThb = Math.round(num * exchangeRate);
    setEditList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amountJpy: val, amountThb: calcThb.toString() } : item))
    );
  };

  const handleThbChange = (id: string, val: string) => {
    const num = parseFloat(val) || 0;
    const calcJpy = exchangeRate > 0 ? Math.round(num / exchangeRate) : 0;
    setEditList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amountThb: val, amountJpy: calcJpy.toString() } : item))
    );
  };

  const handleUpdate = async (item: { id: string; category: string; amountJpy: string; amountThb: string; notes: string }) => {
    setLoadingId(item.id);
    try {
      await updateBudget(item.id, {
        category: item.category,
        amountJpy: parseFloat(item.amountJpy) || 0,
        amountThb: parseFloat(item.amountThb) || 0,
        notes: item.notes || undefined,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update budget");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget wallet?")) return;
    setLoadingId(id);
    try {
      await deleteBudgetWallet(id, tripId);
      setEditList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete budget");
    } finally {
      setLoadingId(null);
    }
  };

  const newNum = parseFloat(newAmount) || 0;
  const newJpyVal = newCurrency === "JPY" ? newNum : exchangeRate > 0 ? Math.round(newNum / exchangeRate) : 0;
  const newThbVal = newCurrency === "THB" ? newNum : Math.round(newNum * exchangeRate);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setAdding(true);
    try {
      const created = await createBudgetWallet(tripId, {
        category: newCategory.trim(),
        amountJpy: newJpyVal || 0,
        amountThb: newThbVal || 0,
      });
      setEditList((prev) => [
        ...prev,
        {
          id: created.id,
          category: created.category,
          amountJpy: created.amountJpy.toString(),
          amountThb: created.amountThb.toString(),
          notes: created.notes || "",
        },
      ]);
      setNewCategory("");
      setNewAmount("");
    } catch (err) {
      console.error(err);
      alert("Failed to add budget");
    } finally {
      setAdding(false);
    }
  };

  const inputClass =
    "px-3 py-2 bg-bg-base border border-border rounded-xl text-text-primary text-xs focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-bg-card border border-border rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/10 text-accent border border-accent/20">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">{t("manageBudgets")}</h3>
              <p className="text-xs text-text-muted">{t("budgetAllocationsSubtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Existing Budget Wallets List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {t("budgetAllocations")} ({editList.length})
            </h4>

            {editList.length === 0 ? (
              <p className="text-xs text-text-faint italic p-4 text-center bg-bg-surface rounded-2xl border border-border">
                {t("noBudgetsTitle")}
              </p>
            ) : (
              editList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-bg-surface border border-border rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) =>
                      setEditList((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, category: e.target.value } : i))
                      )
                    }
                    placeholder={t("walletName")}
                    className={`${inputClass} flex-1 font-semibold`}
                  />

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-28">
                      <JapaneseYen className="w-3.5 h-3.5 text-text-faint absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="number"
                        value={item.amountJpy}
                        onChange={(e) => handleJpyChange(item.id, e.target.value)}
                        placeholder="0"
                        className={`${inputClass} w-full pl-7 font-mono font-bold text-text-primary`}
                      />
                    </div>

                    <div className="relative flex-1 sm:w-28">
                      <Banknote className="w-3.5 h-3.5 text-text-faint absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="number"
                        value={item.amountThb}
                        onChange={(e) => handleThbChange(item.id, e.target.value)}
                        placeholder="0"
                        className={`${inputClass} w-full pl-7 font-mono text-text-secondary`}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={loadingId === item.id}
                      onClick={() => handleUpdate(item)}
                      title={t("saveChanges")}
                      className="p-2 rounded-xl bg-accent text-white hover:bg-accent-light transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={loadingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                      className="p-2 rounded-xl text-text-faint hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add New Budget Wallet Form with Currency Selector */}
          <form onSubmit={handleAdd} className="p-4 bg-bg-surface/60 border border-dashed border-border rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-accent" /> {t("addWallet")}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                required
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. IC Card (Suica), Cash, Wise"
                className={inputClass}
              />

              <div className="flex items-center gap-1.5">
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value as "JPY" | "THB")}
                  className="px-2.5 py-2 bg-bg-base border border-border rounded-xl text-xs font-bold text-accent focus:outline-none focus:border-accent cursor-pointer flex-shrink-0"
                >
                  <option value="JPY">JPY (¥)</option>
                  <option value="THB">THB (฿)</option>
                </select>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder={newCurrency === "JPY" ? "¥ 20,000" : "฿ 5,000"}
                  className={`${inputClass} flex-1 font-mono font-bold`}
                />
              </div>

              {/* Live Preview */}
              <div className="flex items-center justify-between px-3 py-2 bg-bg-base border border-border rounded-xl font-mono text-xs">
                <span className="text-text-muted text-[11px] flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-accent" />
                  <span>≈</span>
                </span>
                <span className="font-bold text-accent">
                  {newCurrency === "JPY" ? formatTHB(newThbVal) : formatJPY(newJpyVal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={adding || !newCategory.trim()}
              className="w-full py-2 rounded-xl bg-accent/15 hover:bg-accent text-accent hover:text-white border border-accent/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{adding ? t("creating") : t("addWallet")}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-light text-white text-xs font-bold shadow-accent transition-all cursor-pointer"
          >
            {t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
