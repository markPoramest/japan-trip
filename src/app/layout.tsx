import type { Metadata } from "next";
import { Suspense } from "react";
import { Noto_Sans_Thai, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import AuthProvider from "@/context/SessionProvider";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import AosProvider from "@/components/AosProvider";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-thai",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Japan Trip Planner — By Mark no Nihon Tabi",
  description: "Interactive Japan Trip Planner with IC card tracking, daily itineraries, and cost calculator.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('theme');
      var root = document.documentElement;
      if (stored === 'light') {
        root.classList.remove('dark');
        root.classList.add('light');
      } else if (stored === 'dark') {
        root.classList.remove('light');
        root.classList.add('dark');
      } else {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(prefersDark ? 'dark' : 'light');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${notoSansThai.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`min-h-screen bg-bg-base text-text-primary antialiased font-sans ${notoSansThai.className}`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          <AosProvider />
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
