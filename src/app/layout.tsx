import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import AosProvider from "@/components/AosProvider";

export const metadata: Metadata = {
  title: "Japan Trip Planner - Next.js & SQL",
  description: "Interactive Japan Trip Planner with IC card tracking, daily itineraries, and cost calculator.",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <AosProvider />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
