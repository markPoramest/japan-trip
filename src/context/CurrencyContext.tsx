"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { formatJPY, formatTHB } from "@/lib/utils";

export type AppCurrency = "THB" | "JPY";

interface CurrencyContextType {
  currency: AppCurrency;
  setCurrency: (c: AppCurrency) => void;
  // Convert from JPY source
  formatFromJpy: (
    jpyAmount: number | null | undefined,
    exchangeRate?: number
  ) => { primary: string; secondary: string; primaryRaw: number; secondaryRaw: number };
  // Convert from THB source
  formatFromThb: (
    thbAmount: number | null | undefined,
    exchangeRate?: number
  ) => { primary: string; secondary: string; primaryRaw: number; secondaryRaw: number };
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "THB",
  setCurrency: () => {},
  formatFromJpy: () => ({ primary: "฿0", secondary: "¥0", primaryRaw: 0, secondaryRaw: 0 }),
  formatFromThb: () => ({ primary: "฿0", secondary: "¥0", primaryRaw: 0, secondaryRaw: 0 }),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<AppCurrency>("THB");

  useEffect(() => {
    const saved = localStorage.getItem("app_currency") as AppCurrency;
    if (saved === "THB" || saved === "JPY") {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: AppCurrency) => {
    setCurrencyState(c);
    localStorage.setItem("app_currency", c);
  };

  const formatFromJpy = (jpyAmount: number | null | undefined, exchangeRate: number = 0.24) => {
    const jpy = jpyAmount || 0;
    const rate = exchangeRate > 0 ? exchangeRate : 0.24;
    const thb = jpy * rate;

    if (currency === "THB") {
      return {
        primary: formatTHB(thb),
        secondary: formatJPY(jpy),
        primaryRaw: thb,
        secondaryRaw: jpy,
      };
    } else {
      return {
        primary: formatJPY(jpy),
        secondary: formatTHB(thb),
        primaryRaw: jpy,
        secondaryRaw: thb,
      };
    }
  };

  const formatFromThb = (thbAmount: number | null | undefined, exchangeRate: number = 0.24) => {
    const thb = thbAmount || 0;
    const rate = exchangeRate > 0 ? exchangeRate : 0.24;
    const jpy = thb / rate;

    if (currency === "THB") {
      return {
        primary: formatTHB(thb),
        secondary: formatJPY(jpy),
        primaryRaw: thb,
        secondaryRaw: jpy,
      };
    } else {
      return {
        primary: formatJPY(jpy),
        secondary: formatTHB(thb),
        primaryRaw: jpy,
        secondaryRaw: thb,
      };
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatFromJpy, formatFromThb }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
