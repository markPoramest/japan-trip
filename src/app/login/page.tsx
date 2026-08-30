"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Compass, ShieldCheck, MapPin, Calendar, CreditCard, Layers, ArrowRight, Loader2, Sparkles, UserCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SettingsKebab from "@/components/SettingsKebab";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const [signingIn, setSigningIn] = useState<string | null>(null);

  const authError = searchParams?.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/trips");
    }
  }, [status, router]);

  const handleGoogleSignIn = () => {
    setSigningIn("google");
    signIn("google", { callbackUrl: "/trips" });
  };

  const handleDemoSignIn = () => {
    setSigningIn("demo");
    signIn("demo", {
      email: "mark@example.com",
      name: "Mark",
      callbackUrl: "/trips",
    });
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col justify-between text-text-primary">
      {/* Top bar */}
      <header className="border-b border-border bg-bg-surface/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center text-lg shadow-accent text-white">
              🗾
            </div>
            <div>
              <span className="text-base font-bold text-text-primary">{t("appTitle")}</span>
              <span className="ml-2 text-xs text-text-muted">{t("appSubtitle")}</span>
            </div>
          </div>
          <SettingsKebab />
        </div>
      </header>

      {/* Main hero login container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row items-center gap-12 flex-1 justify-center">
        {/* Left column: Value Proposition & Privacy */}
        <div className="flex-1 space-y-6 text-center lg:text-left" data-aos="fade-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === "th" ? "พื้นที่วางแผนทริปส่วนตัว 100%" : "100% Private Trip Workspace"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
            {language === "th" ? "วางแผนเที่ยวญี่ปุ่น จัดการค่าใช้จ่ายในที่เดียว" : "Your Personal Japan Travel Hub"}
          </h1>

          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-xl">
            {language === "th"
              ? "สร้างแผนการเดินทางส่วนตัว จัดการตารางรายวัน คำนวณบัตร IC Card ตั๋วพาส โรงแรม และส่งออกเอกสาร ตม. ได้ง่ายๆ"
              : "Organize custom itineraries, track live IC card and transit spend, manage hotel & flight bookings, and export PDF sheets."}
          </p>

          {/* Privacy highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              {
                icon: ShieldCheck,
                title: language === "th" ? "ข้อมูลส่วนตัว ปลอดภัย" : "Private & Secure",
                desc: language === "th" ? "ทริปของคุณมองเห็นได้เฉพาะคุณเท่านั้น" : "Your itineraries belong only to you.",
              },
              {
                icon: CreditCard,
                title: language === "th" ? "คำนวณ 2 สกุลเงินสด" : "Dual Currency Sync",
                desc: language === "th" ? "แปลง JPY ⇄ THB อัตโนมัติทุกจุด" : "Live JPY ⇄ THB auto-calculations.",
              },
              {
                icon: Calendar,
                title: language === "th" ? "กำหนดการรายวันละเอียด" : "Daily Timelines",
                desc: language === "th" ? "บันทึกเวลา พาส และการเดินทาง" : "Hourly stops with transit pass links.",
              },
              {
                icon: Layers,
                title: language === "th" ? "ตารางสรุปงบครบถ้วน" : "Excel Summary",
                desc: language === "th" ? "สรุปแยกตามประเภทและกระเป๋าเงิน" : "Clear breakdown by wallet & category.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-bg-card border border-border/80 text-left space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-text-primary">
                    <Icon className="w-4 h-4 text-accent" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-snug">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Sign In Card */}
        <div className="w-full lg:w-[400px] flex-shrink-0" data-aos="fade-left">
          <div className="bg-bg-card border-2 border-accent/40 rounded-3xl p-8 shadow-earth space-y-5 relative overflow-hidden">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-accent-gradient flex items-center justify-center text-3xl mx-auto shadow-accent text-white">
                🗾
              </div>
              <h2 className="text-2xl font-extrabold text-text-primary">
                {language === "th" ? "เข้าสู่ระบบ" : "Sign In"}
              </h2>
              <p className="text-xs text-text-muted">
                {language === "th"
                  ? "เข้าสู่ระบบเพื่อจัดการทริปส่วนตัวของคุณ"
                  : "Sign in to access your private trip plans"}
              </p>
            </div>

            {/* Error banner if Google Client ID not yet set */}
            {authError && (
              <div className="p-3 rounded-xl bg-accent/15 border border-accent/30 text-xs text-accent space-y-1">
                <p className="font-bold">
                  {language === "th" ? "ต้องการ Google Client ID สำหรับ Google Login" : "Google Client ID required for Google OAuth"}
                </p>
                <p className="text-[11px] text-text-muted">
                  {language === "th"
                    ? "คุณสามารถกดปุ่ม \"เข้าสู่ระบบทันที (Demo)\" ด้านล่างเพื่อทดสอบได้ทันที!"
                    : "You can click \"1-Click Instant Sign In\" below to test right away without keys!"}
                </p>
              </div>
            )}

            {/* 1-Click Instant Demo Login button */}
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={signingIn !== null || status === "loading"}
              className="w-full py-3.5 px-5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-bold text-sm shadow-accent transition-all flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer disabled:opacity-75"
            >
              {signingIn === "demo" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{language === "th" ? "กำลังเข้าสู่ระบบ..." : "Signing in..."}</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-5 h-5" />
                  <span>{language === "th" ? "เข้าสู่ระบบทันที (Mark)" : "1-Click Sign In (Mark)"}</span>
                </>
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-border/80"></div>
              <span className="flex-shrink mx-3 text-[11px] text-text-muted uppercase font-bold tracking-wider">
                {language === "th" ? "หรือ" : "Or"}
              </span>
              <div className="flex-grow border-t border-border/80"></div>
            </div>

            {/* Google Sign in button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={signingIn !== null || status === "loading"}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer disabled:opacity-75"
            >
              {signingIn === "google" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span>{language === "th" ? "กำลังเชื่อมต่อ Google..." : "Connecting Google..."}</span>
                </>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{language === "th" ? "เข้าสู่ระบบด้วย Google" : "Continue with Google"}</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-text-faint space-y-1 pt-1 border-t border-border/60">
              <p>{language === "th" ? "ปลอดภัยและเป็นส่วนตัว 100%" : "Private by design · No public sharing"}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-text-muted">
        <span>© 2026 Japan Trip Planner. All rights reserved.</span>
      </footer>
    </div>
  );
}
