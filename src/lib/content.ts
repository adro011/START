import { GENERATED_CONTENT } from "./content.generated";

/**
 * Site content layer.
 *
 * The single source of truth for all editable site copy is `content/*.txt`
 * (plain `key = value` text files). Those files are compiled into
 * `content.generated.ts` by `scripts/sync-content.mjs` (run via `npm run content`,
 * and automatically before `dev`/`build`).
 *
 * `DEFAULTS` below is the safety net: if a key is ever removed from a content
 * file, the value here is used instead, so the site never breaks or goes blank.
 * Merge order: DEFAULTS <- GENERATED (file values win).
 */

/* ── Shared shapes ─────────────────────────────────────────────────────── */

export interface Panel {
  key: string;
  index: string;
  title: string;
  href: string;
  image: string;
}

export interface Occasion {
  name: string;
  copy: string;
  href: string;
  image: string;
}

export interface Quote {
  quote: string;
  name: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface TrustItem {
  title: string;
  copy: string;
  icon: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Block {
  kind: "h2" | "p" | "ul";
  text?: string;
  item?: Record<string, string>;
}

export type StringMap = Record<string, string>;

/** Image/asset paths grouped by purpose (content/assets/*.txt). */
export interface AssetContent {
  brand: StringMap;
  hero: StringMap;
  categories: StringMap;
  occasions: StringMap;
  products: StringMap;
  backgrounds: StringMap;
}

/** Design tokens: layout, type scale, shapes, shadows, backgrounds, layers. */
export interface DesignContent {
  layout: StringMap;
  typography: StringMap;
  shapes: StringMap;
  elevation: StringMap;
  backgrounds: StringMap;
  layers: StringMap;
}

/** Animation timing + per-effect settings (content/motion/*.txt). */
export interface MotionContent {
  global: StringMap;
  effects: StringMap;
}

/** Feature switches for client scripts (content/scripts/features.txt). */
export interface ScriptContent {
  features: StringMap;
}

/* ── Full content shape ────────────────────────────────────────────────── */

export interface SiteContent {
  site: {
    name: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    supportHours: string;
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  announcement: Record<string, string>;
  theme: Record<string, unknown>;
  home: {
    cover: {
      eyebrow: string;
      title: string;
      subtitle: string;
      cta: { arrivals: string; women: string };
      location: string;
      scroll: string;
      number: string;
    };
    hero: {
      eyebrow: { left: string; right: string };
      scrollcue: string;
      hoverhint: string;
      panel: Record<string, Panel>;
      marquee: Record<string, string>;
    };
    statement: { kicker: string; headline: string; accent: string };
    arrivals: { kicker: string; title: string; copy: string; cta: string; empty: string };
    category: { kicker: string; title: string; copy: string; cta: string };
    occasion: { kicker: string; title: string; copy: string; cta: string; item: Record<string, Occasion> };
    sale: { kicker: string; title: string; copy: string; cta: string };
    craft: {
      kicker: string;
      title: string;
      body: string;
      cta: string;
      stat: Record<string, Stat>;
    };
    testimonials: { kicker: string; title: string };
    testimonial: Record<string, Quote>;
    trust: Record<string, TrustItem>;
    newsletter: { kicker: string; title: string; copy: string; cta: string };
  };
  pages: Record<string, Record<string, unknown>>;
  assets: AssetContent;
  design: DesignContent;
  motion: MotionContent;
  scripts: ScriptContent;
}

/* ── Defaults (fallback) ───────────────────────────────────────────────── */

const DEFAULTS: SiteContent = {
  site: {
    name: "ABRAR",
    tagline: "Connecting Consumer through Digital media",
    description:
      "ABRAR — Connecting Consumer through Digital media. A modern Bangladeshi heritage label — panjabis, sharees, kurtas and kids' wear in breathable fabrics, cut for real life and made to be reworn.",
    phone: "+8801712216576",
    email: "ziahoque1980@gmail.com",
    supportHours: "Sat–Thu, 10am–8pm (BST)",
    facebook: "https://www.facebook.com/profile.php?id=61560882538280",
    instagram: "https://instagram.com/abrarexclusive.bd",
    youtube: "https://youtube.com/@abrarexclusive.bd",
    tiktok: "https://tiktok.com/@abrarexclusive.bd",
  },
  announcement: {
    "1": "Free delivery in Dhaka on orders over ৳2,500 · 7-day easy exchange",
    "2": "The Eid edit is live — panjabis, sharees & kids' sets",
    "3": "Cash on delivery, all across Bangladesh",
  },
  theme: {
    color: {
      black: "#000000",
      gold: "#FFC000",
      goldBright: "#FFD600",
      goldDark: "#917300",
      goldText: "#FFCE3E",
      blush: "#F2CCC3",
      clay: "#A93A24",
      paper: "#FBF6F3",
      ink: "#172121",
      smoke: "#F5F5F5",
      steel: "#969696",
      ash: "#7D7D7D",
      graphite: "#494949",
      charcoal: "#202020",
      darkIron: "#181818",
      surface: "#0d0d0d",
      border: "rgba(255,255,255,0.12)",
      focus: "#FFD600",
      overlay: "rgba(0,0,0,0.55)",
      success: "#2FBF71",
      error: "#E5484D",
      warning: "#F5A524",
      info: "#29ABE2",
    },
    font: {
      display: `"LamboType", "Roboto", "Helvetica Neue", Arial, sans-serif`,
      ui: `"LamboType", "Open Sans", sans-serif`,
      serif: `"Cormorant Garamond", "Playfair Display", Georgia, serif`,
      mono: `"SF Mono", Monaco, "Courier New", monospace`,
    },
    ease: {
      lux: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
    marquee: {
      speed: "58s",
    },
    spotlight: {
      base: "#010101",
      core: "255, 248, 150",
      mid: "255, 230, 0",
      outer: "255, 185, 0",
    },
  },
  home: {
    cover: {
      eyebrow: "New Collection — Eid '26 Edit",
      title: "ABRAR",
      subtitle: "Connecting Consumer through Digital media",
      cta: { arrivals: "Shop new arrivals", women: "Explore women" },
      location: "Dhaka — Worldwide",
      scroll: "Scroll",
      number: "N°01 — The Cover",
    },
    hero: {
      eyebrow: {
        left: "Connecting Consumer through Digital media",
        right: "Est. Dhaka · Eid '26 edit live",
      },
      scrollcue: "Scroll to enter the house",
      hoverhint: "Hover to open · click a panel to step in",
      panel: {
        "1": { key: "men", index: "01", title: "MAN", href: "/men", image: "/library/men.png" },
        "2": { key: "women", index: "02", title: "WOMEN", href: "/women", image: "/library/women.png" },
        "3": { key: "kids", index: "03", title: "CHILDREN", href: "/kids", image: "/library/children.png" },
      },
      marquee: {
        "1": "Promising Quality",
        "2": "Delivery throughout Bangladesh",
        "3": "Beauty, Elegance and Simplicity",
      },
    },
    statement: {
      kicker: "The house of Abrar",
      headline: "Quiet luxury, cut for real weather",
      accent: "and real bodies.",
    },
    arrivals: {
      kicker: "Just landed — small batches",
      title: "New arrivals",
      copy: "Honest fabrics, limited runs. When it's gone, it's gone.",
      cta: "View all",
      empty: "Fresh pieces are on the cutting table — check back very soon.",
    },
    category: {
      kicker: "Find your lane",
      title: "Shop by category",
      copy: "Three sections, one thread: clothes that respect the craft.",
      cta: "Explore",
    },
    occasion: {
      kicker: "Dress for the day",
      title: "Shop by occasion",
      copy: "Eid mornings, wedding evenings, and everything in between.",
      cta: "Shop now",
      item: {
        "1": { name: "Eid", copy: "Moonlit whites & golds", href: "/women?occasion=eid", image: "/library/photo-album/EID.jpg" },
        "2": { name: "Wedding", copy: "Heirlooms in the making", href: "/women?occasion=wedding", image: "/library/photo-album/WEDDING.jpg" },
        "3": { name: "Everyday", copy: "Breathable, reworn often", href: "/men?occasion=everyday", image: "/library/photo-album/Everyday.jpg" },
        "4": { name: "Winter", copy: "Layers with intention", href: "/men?occasion=winter", image: "/library/photo-album/WINTER.jpg" },
      },
    },
    sale: {
      kicker: "Up to honest markdowns",
      title: "The sale edit",
      copy: "Last pieces, best fabrics. Loved by regulars.",
      cta: "Shop sale",
    },
    craft: {
      kicker: "Woven, not rushed",
      title: "From loom to doorstep, with patience.",
      body: "We work with weaving clusters across Bangladesh — muslin, endi, silk — and cut every piece for real bodies and real weather. No overproduction, no shouting discounts. Just clothes that earn their place.",
      cta: "Read our story",
      stat: {
        "1": { value: "40+", label: "artisan clusters" },
        "2": { value: "100%", label: "breathable fabrics" },
        "3": { value: "7-day", label: "easy exchange" },
      },
    },
    testimonials: { kicker: "Worn & loved", title: "Word on the street" },
    testimonial: {
      "1": { quote: "The panjabi fits like it was cut for me. Wore it all Eid, zero wrinkles.", name: "Tanvir · Dhaka" },
      "2": { quote: "Ordered Tuesday, delivered Thursday. The muslin sharee is softer in person.", name: "Nusrat · Chattogram" },
      "3": { quote: "Finally, kids' festive wear that survives actual kids. Exchanged a size over WhatsApp in minutes.", name: "Faria · Sylhet" },
    },
    trust: {
      "1": { title: "Cash on delivery", copy: "Pay at your door, anywhere in Bangladesh.", icon: "৳" },
      "2": { title: "7-day exchange", copy: "Wrong size? We swap it fast, no drama.", icon: "↺" },
      "3": { title: "WhatsApp support", copy: "Real humans, Sat–Thu 10am–8pm.", icon: "✦" },
    },
    newsletter: {
      kicker: "The letter — 10% off first order",
      title: "First dibs, every drop.",
      copy: "Join for 10% off your first order over ৳2,500 — plus craft notes worth opening.",
      cta: "Join us",
    },
  },
  pages: {},
  assets: {
    brand: {
      logo: "/logo.svg",
      logoAlt: "ABRAR wordmark",
      monogram: "/hero/icons/icon-512.png",
      favicon16: "/hero/icons/favicon-16.png",
      favicon32: "/hero/icons/favicon-32.png",
      favicon48: "/hero/icons/favicon-48.png",
      appleIcon: "/apple-icon.png",
      pwa192: "/hero/icons/icon-192.png",
      pwa512: "/hero/icons/icon-512.png",
      pwaMaskable192: "/hero/icons/maskable-192.png",
      pwaMaskable512: "/hero/icons/maskable-512.png",
      openGraph: "/hero/icons/MAIN LOGO.png",
    },
    hero: {
      "cover.image": "/hero/women.jpg",
      "cover.alt": "ABRAR editorial campaign",
      "cover.overlay": "rgba(0,0,0,0.38)",
      "panel.men.tile": "/library/men.png",
      "panel.men.portrait": "/hero/men.jpg",
      "panel.men.icon": "/hero/men.svg",
      "panel.men.href": "/men",
      "panel.men.alt": "Men's collection",
      "panel.women.tile": "/library/women.png",
      "panel.women.portrait": "/hero/women.jpg",
      "panel.women.icon": "/hero/women.svg",
      "panel.women.href": "/women",
      "panel.women.alt": "Women's collection",
      "panel.kids.tile": "/library/children.png",
      "panel.kids.portrait": "/hero/kids.jpg",
      "panel.kids.icon": "/hero/kids.svg",
      "panel.kids.href": "/kids",
      "panel.kids.alt": "Children's collection",
    },
    categories: {
      "men.tile": "/library/men.png",
      "men.portrait": "/hero/men.jpg",
      "men.icon": "/hero/men.svg",
      "men.alt": "Men's collection",
      "women.tile": "/library/women.png",
      "women.portrait": "/hero/women.jpg",
      "women.icon": "/hero/women.svg",
      "women.alt": "Women's collection",
      "kids.tile": "/library/children.png",
      "kids.portrait": "/hero/kids.jpg",
      "kids.icon": "/hero/kids.svg",
      "kids.alt": "Children's collection",
    },
    occasions: {
      "eid.image": "/library/photo-album/EID.jpg",
      "eid.alt": "Eid collection",
      "eid.href": "/women?occasion=eid",
      "wedding.image": "/library/photo-album/WEDDING.jpg",
      "wedding.alt": "Wedding collection",
      "wedding.href": "/women?occasion=wedding",
      "everyday.image": "/library/photo-album/Everyday.jpg",
      "everyday.alt": "Everyday collection",
      "everyday.href": "/men?occasion=everyday",
      "winter.image": "/library/photo-album/WINTER.jpg",
      "winter.alt": "Winter collection",
      "winter.href": "/men?occasion=winter",
    },
    products: {
      folder: "/products",
      pattern: "{slug}-{n}.jpg",
      fallback: "/hero/women.jpg",
      aspect: "3/4",
      "card.sizes": "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
      "detail.sizes": "(max-width: 768px) 100vw, 50vw",
      "placeholder.color": "#0d0d0d",
      "placeholder.label": "Image coming soon",
    },
    backgrounds: {
      "page.image": "",
      "header.image": "",
      "footer.image": "",
      "cover.image": "/hero/women.jpg",
      "sale.image": "",
      "craft.image": "",
      "loader.image": "",
      "grain.image": "",
      "grain.opacity": "0.05",
    },
  },
  design: {
    layout: {
      "container.max": "1440px",
      "container.padX": "20px",
      "section.padY": "96px",
      "section.padYmobile": "56px",
      "grid.columns": "12",
      "grid.gap": "24px",
      "header.height": "68px",
      "announcement.height": "32px",
      "footer.padY": "64px",
      "drawer.width": "420px",
      "menu.max": "1200px",
    },
    typography: {
      "size.hero": "clamp(54px, 12vw, 120px)",
      "size.display1": "clamp(40px, 8vw, 80px)",
      "size.display2": "clamp(32px, 6vw, 54px)",
      "size.display3": "clamp(28px, 5vw, 40px)",
      "size.display4": "clamp(22px, 4vw, 30px)",
      "size.feature": "clamp(20px, 3vw, 27px)",
      "size.cardTitle": "clamp(18px, 2.5vw, 24px)",
      "size.bodyLarge": "clamp(16px, 2vw, 18px)",
      "size.body": "clamp(14px, 1.5vw, 16px)",
      "size.bodySmall": "clamp(12px, 1vw, 14px)",
      "size.caption": "clamp(11px, 1vw, 14px)",
      "weight.light": "300",
      "weight.regular": "400",
      "weight.medium": "500",
      "weight.semibold": "600",
      "weight.bold": "700",
      "line.tight": "1.05",
      "line.normal": "1.5",
      "line.loose": "1.8",
      "tracking.tight": "-0.02em",
      "tracking.normal": "0.02em",
      "tracking.wide": "0.14em",
      "tracking.kicker": "0.22em",
    },
    shapes: {
      "radius.xs": "2px",
      "radius.sm": "4px",
      "radius.md": "8px",
      "radius.lg": "16px",
      "radius.pill": "999px",
      "border.width": "1px",
      "border.style": "solid",
      "card.aspect": "3/4",
      "button.height": "44px",
      "input.height": "44px",
      "divider.width": "1px",
      "panel.rounding": "0px",
      "image.rounding": "0px",
    },
    elevation: {
      "shadow.card": "0 8px 24px rgba(0,0,0,0.35)",
      "shadow.hover": "0 24px 48px rgba(0,0,0,0.45)",
      "shadow.menu": "0 20px 60px rgba(0,0,0,0.60)",
      "shadow.drawer": "-24px 0 60px rgba(0,0,0,0.60)",
      "shadow.modal": "0 24px 80px rgba(0,0,0,0.70)",
      "glow.gold": "0 0 24px rgba(255,214,0,0.35)",
      "glow.soft": "0 0 40px rgba(255,255,255,0.08)",
    },
    backgrounds: {
      "page.color": "#000000",
      "header.color": "#000000",
      "footer.color": "#0d0d0d",
      "section.color": "#000000",
      "card.color": "#0d0d0d",
      "overlay.color": "rgba(0,0,0,0.55)",
      "overlay.soft": "rgba(0,0,0,0.30)",
      "gradient.hero": "linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.75))",
      "gradient.sale": "linear-gradient(135deg, rgba(255,192,0,0.12), rgba(0,0,0,0))",
      "grain.opacity": "0.05",
    },
    layers: {
      base: "0",
      content: "10",
      sticky: "20",
      header: "30",
      menu: "40",
      drawer: "50",
      overlay: "60",
      modal: "70",
      toast: "75",
      cursor: "78",
      grain: "80",
      loader: "90",
    },
  },
  motion: {
    global: {
      "duration.instant": "100ms",
      "duration.fast": "200ms",
      "duration.base": "350ms",
      "duration.slow": "600ms",
      "duration.hero": "900ms",
      "ease.standard": "cubic-bezier(0.22, 1, 0.36, 1)",
      "ease.enter": "cubic-bezier(0.22, 1, 0.36, 1)",
      "ease.exit": "cubic-bezier(0.4, 0, 1, 1)",
      "ease.spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      "gsap.ease": "power3.out",
      "stagger.tight": "0.04",
      "stagger.base": "0.08",
      "stagger.section": "0.16",
      reducedMotion: "respect",
    },
    effects: {
      "hero.entryDuration": "0.6",
      "hero.stagger": "0.08",
      "hero.hoverDuration": "0.4",
      "hero.parallaxMax": "24",
      "hero.zoom": "0.54",
      "reveal.duration": "0.7",
      "reveal.distance": "24",
      "reveal.start": "top 88%",
      "reveal.stagger": "0.08",
      "parallax.max": "24",
      "marquee.speed": "58s",
      "loader.minDuration": "400ms",
      "loader.maxWait": "6000ms",
      "cursor.lerp": "0.18",
      "cursor.size": "40px",
      "magnetic.strength": "0.35",
      "smooth.lerp": "0.11",
      "category.hoverGrow": "2.0",
      "category.othersGrow": "0.85",
      "category.duration": "1.7",
      "spotlight.maxRadiusFactor": "0.72",
      "spotlight.minRadius": "460",
    },
  },
  scripts: {
    features: {
      smoothScroll: "true",
      spotlight: "true",
      cursorRing: "true",
      brandLoader: "true",
      particleInspector: "true",
      serviceWorker: "true",
      tabRefresh: "true",
      searchPalette: "true",
      occasionEffects: "true",
      microFx: "true",
      whatsappOrder: "true",
    },
  },
};

/* ── Deep merge (DEFAULTS <- GENERATED) ────────────────────────────────── */

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) {
    return (override === undefined ? base : (override as T));
  }
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    out[k] = isObject(v) && isObject((base as Record<string, unknown>)[k])
      ? deepMerge((base as Record<string, unknown>)[k], v)
      : v;
  }
  return out as T;
}

export const CONTENT: SiteContent = deepMerge(
  DEFAULTS,
  GENERATED_CONTENT
);

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** Turns a `{ "1": a, "2": b }` object into `[a, b]` (preserves key order). */
export function toArray<T>(obj: Record<string, T> | undefined): T[] {
  if (!obj) return [];
  return Object.values(obj);
}

/** Replaces {name}/{tagline}/{phone}/{email}/{supportHours} tokens with site values. */
export function resolve(text: string | undefined): string {
  if (!text) return "";
  const s = CONTENT.site;
  return text
    .replaceAll("{name}", s.name)
    .replaceAll("{tagline}", s.tagline)
    .replaceAll("{phone}", s.phone)
    .replaceAll("{email}", s.email)
    .replaceAll("{supportHours}", s.supportHours);
}

/* ── Page-content helpers (safe accessors with zero casts) ──────────────── */

/** Returns a page's content object (empty object if missing). */
export function page(name: string): Record<string, unknown> {
  return CONTENT.pages[name] ?? {};
}

/** Coerces an unknown content value to a string (empty string if missing). */
export function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Coerces an unknown content value to a record (empty object if missing). */
export function rec(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Resolves a string content value (tokens replaced). */
export function text(value: unknown): string {
  return resolve(str(value));
}

/* ── Labelled-section accessors (assets · design · motion · scripts) ────── */

function pick(
  group: Record<string, string> | undefined,
  key: string,
  fallback: string
): string {
  const value = group?.[key];
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

/** Reads an image/asset path: `asset("brand", "logo")`. */
export function asset(
  group: keyof AssetContent,
  key: string,
  fallback = ""
): string {
  return pick(CONTENT.assets[group], key, fallback);
}

/** Reads a design token: `designValue("shapes", "radius.lg")`. */
export function designValue(
  group: keyof DesignContent,
  key: string,
  fallback = ""
): string {
  return pick(CONTENT.design[group], key, fallback);
}

/** Reads a motion token: `motionValue("effects", "reveal.duration")`. */
export function motionValue(
  group: keyof MotionContent,
  key: string,
  fallback = ""
): string {
  return pick(CONTENT.motion[group], key, fallback);
}

/** Reads a motion token as a number (NaN-safe with fallback). */
export function motionNumber(
  group: keyof MotionContent,
  key: string,
  fallback: number
): number {
  const n = Number.parseFloat(pick(CONTENT.motion[group], key, ""));
  return Number.isFinite(n) ? n : fallback;
}

/** Reads an on/off switch: `feature("smoothScroll")`. */
export function feature(name: string, fallback = true): boolean {
  const value = CONTENT.scripts.features[name];
  if (typeof value !== "string" || value.trim() === "") return fallback;
  return !/^(false|0|no|off)$/i.test(value.trim());
}
