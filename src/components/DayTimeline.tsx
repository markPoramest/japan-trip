"use client";

import { useState } from "react";
import { formatJPY, formatTHB } from "@/lib/utils";
import { deleteActivity } from "@/lib/actions";
import ActivityFormModal from "./ActivityFormModal";
import {
  Clock, MapPin, CreditCard, Train, ExternalLink,
  Plus, Edit2, Trash2, Banknote, DollarSign, AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Activity {
  id: string;
  time: string;
  location: string;
  activity: string;
  cost: number;
  isIcCard: boolean;
  usingPass: string | null;
  remark: string | null;
  sortOrder: number;
}

interface DayTimelineProps {
  tripId: string;
  dayId: string;
  dayNumber: number;
  dayTitle: string;
  date: Date;
  dayOfWeek: string;
  activities: Activity[];
  availablePasses?: string[];
  exchangeRate?: number;
}

export default function DayTimeline({
  tripId,
  dayId,
  dayNumber,
  dayTitle,
  date,
  dayOfWeek,
  activities,
  availablePasses = [],
  exchangeRate = 0.24,
}: DayTimelineProps) {
  const { t, language } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  const icCost = activities.filter((a) => a.isIcCard).reduce((sum, a) => sum + (a.cost || 0), 0);
  const nonIcCost = totalCost - icCost;

  const dateLocale = language === "th" ? "th-TH" : "en-GB";
  const formattedDate = new Date(date).toLocaleDateString(dateLocale, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    setDeletingId(id);
    try { await deleteActivity(id); }
    catch (e) { console.error(e); alert("Failed to delete"); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="space-y-6">
      {/* Day Header & Live Stats */}
      <div data-aos="fade-down" className="bg-bg-card border border-border rounded-3xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
                {t("day")} {dayNumber}
              </span>
              <span className="text-sm text-text-muted">{formattedDate}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{dayTitle}</h1>
          </div>
          <button
            onClick={() => { setEditingActivity(null); setModalOpen(true); }}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-white text-sm font-bold shadow-accent flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t("addStopActivity")}
          </button>
        </div>

        {/* Live Cost Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-border">
          {[
            { label: t("totalDayCost"), value: formatJPY(totalCost), sub: `≈ ${formatTHB(totalCost * exchangeRate)}`, color: "text-text-primary", bg: "bg-bg-surface", icon: DollarSign, iconColor: "text-sand" },
            { label: t("icCardSpent"), value: formatJPY(icCost), sub: `≈ ${formatTHB(icCost * exchangeRate)}`, color: "text-sage", bg: "bg-bg-surface", icon: CreditCard, iconColor: "text-sage", pct: totalCost > 0 ? Math.round((icCost / totalCost) * 100) : 0, badge: "text-sage bg-sage-subtle border border-sage-muted" },
            { label: t("cashAndCreditCard"), value: formatJPY(nonIcCost), sub: `≈ ${formatTHB(nonIcCost * exchangeRate)}`, color: "text-sand", bg: "bg-bg-surface", icon: Banknote, iconColor: "text-sand", pct: totalCost > 0 ? Math.round((nonIcCost / totalCost) * 100) : 0, badge: "text-sand bg-sand-subtle border border-sand-muted" },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} data-aos="fade-up" data-aos-delay={idx * 80} className={`${stat.bg} border border-border rounded-xl p-3.5 flex items-center justify-between`}>
                <div>
                  <div className="text-xs text-text-muted">{stat.label}</div>
                  <div className={`text-base font-bold font-mono ${stat.color} mt-0.5`}>{stat.value}</div>
                  <div className="text-[10px] text-text-muted font-mono">{stat.sub}</div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <div className="p-2 rounded-lg bg-bg-card border border-border">
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                  {stat.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${stat.badge}`}>
                      {stat.pct}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div data-aos="fade-up" className="bg-bg-card border border-border border-dashed rounded-3xl p-12 text-center text-text-muted shadow-card">
            <AlertCircle className="w-8 h-8 text-text-faint mx-auto mb-2" />
            <p className="font-semibold text-text-secondary">{t("noActivitiesTitle")}</p>
            <p className="text-xs text-text-muted mt-1">{t("noActivitiesSubtitle")}</p>
          </div>
        ) : (
          activities.map((activity, idx) => {
            const linkMatch = activity.remark ? activity.remark.match(/https?:\/\/[^\s]+/) : null;
            const linkUrl = linkMatch ? linkMatch[0] : null;

            return (
              <div
                key={activity.id}
                data-aos="fade-up"
                data-aos-delay={(idx % 6) * 60}
                className="bg-bg-card border border-border rounded-2xl p-5 hover:border-accent/40 hover:shadow-card transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Time badge */}
                  <div className="flex items-center sm:flex-col sm:items-start gap-2 sm:gap-1 sm:w-24 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                      <Clock className="w-3 h-3" />
                      {activity.time || "—"}
                    </span>
                  </div>

                  {/* Main details */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="font-bold text-text-primary text-base flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-accent/70 flex-shrink-0" />
                        <span className="truncate">{activity.location}</span>
                      </div>

                      <div className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                        {activity.activity}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1.5">
                        {activity.isIcCard ? (
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-sage-subtle text-sage border border-sage-muted font-semibold flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> {t("icCardOnly")}
                          </span>
                        ) : activity.cost > 0 ? (
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-sand-subtle text-sand border border-sand-muted font-semibold flex items-center gap-1">
                            <Banknote className="w-3 h-3" /> {t("cashAndCredit")}
                          </span>
                        ) : null}

                        {activity.usingPass && (
                          <span className="text-[11px] px-2.5 py-1 rounded-full bg-olive-subtle text-olive border border-olive-muted font-semibold flex items-center gap-1">
                            <Train className="w-3 h-3" /> {activity.usingPass}
                          </span>
                        )}

                        {activity.remark && (
                          <div className="text-xs text-text-muted flex items-center gap-1 bg-bg-surface px-2.5 py-1 rounded-lg border border-border/60">
                            {linkUrl ? (
                              <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">
                                <span>{activity.remark.replace(linkUrl, "").trim() || t("scheduleOrInfo")}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span>{activity.remark}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                      {activity.cost > 0 ? (
                        <div className="text-right">
                          <span className="text-base font-extrabold text-text-primary font-mono block">{formatJPY(activity.cost)}</span>
                          <span className="text-[10px] text-text-muted font-mono block">≈ {formatTHB(activity.cost * exchangeRate)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-text-faint">{t("freeOrPass")}</span>
                      )}

                      <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingActivity(activity); setModalOpen(true); }} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors cursor-pointer" title={t("editStopActivity")}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(activity.id)} disabled={deletingId === activity.id} className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent-muted transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ActivityFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        dayId={dayId}
        exchangeRate={exchangeRate}
        availablePasses={availablePasses}
        activity={editingActivity}
      />
    </div>
  );
}
