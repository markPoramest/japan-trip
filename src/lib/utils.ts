import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJPY(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "¥0";
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTHB(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "฿0";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0";
  return new Intl.NumberFormat("en-US").format(amount);
}
