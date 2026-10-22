/**
 * Brand + site constants.
 *
 * The single source of truth for brand identity is `content/site.txt`
 * (edit that plain-text file, then run `npm run content`). This module reads
 * those values via the content layer and derives the derived fields
 * (WhatsApp digits/display, socials object) used across the app.
 */

import { CONTENT } from "@/lib/content";

export const BRAND_NAME = CONTENT.site.name;

/**
 * ── CONTACT / WHATSAPP — SINGLE SOURCE OF TRUTH ─────────────────────────────
 * The one number used by the header, footer, product page and every wa.me
 * link. Change it in `content/site.txt` (phone), or set NEXT_PUBLIC_WHATSAPP
 * at build time (full international form, e.g. "+8801XXXXXXXXX").
 */
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP ?? CONTENT.site.phone).trim();
const WHATSAPP_DIGITS = WHATSAPP_NUMBER.replace(/\D/g, "");
const WHATSAPP_DISPLAY = WHATSAPP_DIGITS.startsWith("880")
  ? `0${WHATSAPP_DIGITS.slice(3)}`
  : WHATSAPP_DIGITS;

export const SITE = {
  name: CONTENT.site.name,
  tagline: CONTENT.site.tagline,
  description: CONTENT.site.description,
  phone: CONTENT.site.phone,
  whatsapp: WHATSAPP_NUMBER,
  /** Digits-only WhatsApp for wa.me links (derived from WHATSAPP_NUMBER). */
  whatsappDigits: WHATSAPP_DIGITS,
  whatsappDisplay: WHATSAPP_DISPLAY,
  email: CONTENT.site.email,
  currency: "৳" as const,
  locale: "en-BD" as const,
  socials: {
    facebook: CONTENT.site.facebook,
    instagram: CONTENT.site.instagram,
    youtube: CONTENT.site.youtube,
    tiktok: CONTENT.site.tiktok,
  },
  supportHours: CONTENT.site.supportHours,
} as const;

export type SiteNavKey =
  | "men"
  | "women"
  | "kids"
  | "new-arrivals"
  | "sale"
  | "stories";

export const NAV: { key: SiteNavKey; href: string }[] = [
  { key: "men", href: "/men" },
  { key: "women", href: "/women" },
  { key: "kids", href: "/kids" },
  { key: "new-arrivals", href: "/new-arrivals" },
  { key: "sale", href: "/sale" },
  { key: "stories", href: "/stories" },
];

/** Districts served at launch (shipping zones build on this list). */
export const DISTRICTS: string[] = [
  "Dhaka",
  "Gazipur",
  "Narayanganj",
  "Chattogram",
  "Cumilla",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
];

/**
 * Free-shipping threshold. Money is integer paisa everywhere:
 * 250_000 paisa = ৳2,500.
 */
export const FREE_SHIP_THRESHOLD_PAISA = 250_000;

export const SUPPORTED_LOCALES = ["en", "bn"] as const;
