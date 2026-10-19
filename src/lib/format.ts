import type { MouseEvent } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class lists, resolving conflicts (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Force a full-page navigation (hard reload) to `href` on a plain left click.
 * Modifier/middle clicks (open in new tab/window) and already-handled events
 * are left to the browser, so Next.js `<Link>` prefetch still works elsewhere.
 */
export function hardNav(href: string) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    window.location.assign(href);
  };
}

/**
 * Format integer paisa as BDT, e.g. 125000 -> "৳1,250".
 * Uses en-IN digit grouping (lakh/crore style used in BD).
 */
export function formatBDT(paisa: number): string {
  if (!Number.isFinite(paisa)) return "৳0";
  const taka = Math.round(paisa / 100);
  return `৳${taka.toLocaleString("en-IN")}`;
}

/**
 * Normalize a BD phone number to display form "01XXXXXXXXX".
 * Accepts +8801XXXXXXXXX, 8801XXXXXXXXX, 01XXXXXXXXX.
 * Returns the input untouched when it does not look like a valid BD mobile.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  let local = digits;
  if (digits.startsWith("880") && digits.length === 13) {
    local = "0" + digits.slice(3);
  } else if (digits.length === 10 && digits.startsWith("1")) {
    local = "0" + digits;
  }
  if (/^01[3-9]\d{8}$/.test(local)) return local;
  return phone;
}

/** True when the string is a valid BD mobile (01[3-9]XXXXXXXX). */
export function isValidBdPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("880") ? "0" + digits.slice(3) : digits;
  return /^01[3-9]\d{8}$/.test(local);
}
