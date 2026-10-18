/**
 * Brand + site constants.
 *
 * BRAND_NAME lives ONLY here — it is the single source of truth for brand
 * identity. Never hardcode the brand name anywhere else; import SITE instead.
 * (plan.md §0: brand placeholder lives in src/config/site.ts)
 */

export const BRAND_NAME = "ABRAR";

/**
 * ── CONTACT / WHATSAPP — SINGLE SOURCE OF TRUTH ─────────────────────────────
 * The one number used by the header, footer, product page and every wa.me
 * link. Change it HERE, or set NEXT_PUBLIC_WHATSAPP at build time (full
 * international form, e.g. "+8801XXXXXXXXX") without editing code.
 */
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP ?? "+8801712216576").trim();
const WHATSAPP_DIGITS = WHATSAPP_NUMBER.replace(/\D/g, "");
const WHATSAPP_DISPLAY = WHATSAPP_DIGITS.startsWith("880")
  ? `0${WHATSAPP_DIGITS.slice(3)}`
  : WHATSAPP_DIGITS;

export const SITE = {
  name: BRAND_NAME,
  tagline: "Connecting Consumer through Digital media",
  description:
    "ABRAR — Connecting Consumer through Digital media. A modern Bangladeshi heritage label — panjabis, sharees, kurtas and kids' wear in breathable fabrics, cut for real life and made to be reworn.",
  phone: WHATSAPP_NUMBER,
  whatsapp: WHATSAPP_NUMBER,
  /** Digits-only WhatsApp for wa.me links (derived from WHATSAPP_NUMBER). */
  whatsappDigits: WHATSAPP_DIGITS,
  whatsappDisplay: WHATSAPP_DISPLAY,
  email: "ziahoque1980@gmail.com",
  currency: "৳" as const,
  locale: "en-BD" as const,
  socials: {
    facebook: "https://www.facebook.com/profile.php?id=61560882538280",
    instagram: "https://instagram.com/abrarexclusive.bd",
    youtube: "https://youtube.com/@abrarexclusive.bd",
    tiktok: "https://tiktok.com/@abrarexclusive.bd",
  },
  supportHours: "Sat–Thu, 10am–8pm (BST)",
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
