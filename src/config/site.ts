/**
 * Brand + site constants.
 *
 * BRAND_NAME lives ONLY here — it is the single source of truth for brand
 * identity. Never hardcode the brand name anywhere else; import SITE instead.
 * (plan.md §0: brand placeholder lives in src/config/site.ts)
 */

export const BRAND_NAME = "ABRAR";

export const SITE = {
  name: BRAND_NAME,
  tagline: "Connecting Consumer through Digital media",
  description:
    "ABRAR — Connecting Consumer through Digital media. A modern Bangladeshi heritage label — panjabis, sharees, kurtas and kids' wear in breathable fabrics, cut for real life and made to be reworn.",
  phone: "+8801XXXXXXXXX",
  whatsapp: "+8801XXXXXXXXX",
  /** Digits-only WhatsApp for wa.me links (derived, keeps placeholder in one place). */
  whatsappDigits: "8801XXXXXXXX",
  whatsappDisplay: "01XXXXXXXXX",
  email: "hello@example.com",
  currency: "৳" as const,
  locale: "en-BD" as const,
  socials: {
    facebook: "https://facebook.com/abrarexclusive.bd",
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
