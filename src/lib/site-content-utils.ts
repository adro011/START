/**
 * Pure utility functions for site content — no "use server" directive,
 * safe to import in both server and client components.
 */

export type SectionKind =
  | "hero"
  | "panels"
  | "statement"
  | "grid"
  | "split"
  | "carousel"
  | "trust"
  | "instagram"
  | "newsletter"
  | "custom";

export interface SiteSection {
  key: string;
  label: string;
  kind: SectionKind;
  sort: number;
  enabled: boolean;
  content: unknown;
  styles: Record<string, string>;
  created_at: string;
  updated_at: string;
}


export const TOKEN_TO_CSS_VAR: Record<string, string> = {
  "color-primary-gold": "--color-primary-gold",
  "color-primary-gold-hover": "--color-primary-gold-hover",
  "color-primary-gold-text": "--color-primary-gold-text",
  "color-accent-cyan": "--color-accent-cyan",
  "color-accent-link-blue": "--color-accent-link-blue",
  "color-accent-teal-action": "--color-accent-teal-action",
  "color-semantic-success": "--color-semantic-success",
  "color-semantic-error": "--color-semantic-error",
  "color-semantic-warning": "--color-semantic-warning",
  "color-semantic-info": "--color-semantic-info",
  "color-surface-level0": "--color-surface-level0",
  "color-surface-level1": "--color-surface-level1",
  "color-surface-level2": "--color-surface-level2",
  "color-surface-level3": "--color-surface-level3",
  "color-surface-level4": "--color-surface-level4",
  "color-surface-level5": "--color-surface-level5",
  "color-border-primary": "--color-border-primary",
  "color-border-secondary": "--color-border-secondary",
  "color-border-focus": "--color-border-focus",
  "font-family-display": "--font-family-display",
  "font-family-ui": "--font-family-ui",
  "font-family-mono": "--font-family-mono",
  "font-size-hero": "--font-size-hero",
  "font-size-display2": "--font-size-display2",
  "font-size-display3": "--font-size-display3",
  "font-size-display4": "--font-size-display4",
  "font-size-feature": "--font-size-feature",
  "font-size-card-title": "--font-size-card-title",
  "font-size-body-large": "--font-size-body-large",
  "font-size-body": "--font-size-body",
  "font-size-body-small": "--font-size-body-small",
  "font-size-caption": "--font-size-caption",
  "space-4": "--space-4",
  "space-6": "--space-6",
  "space-8": "--space-8",
  "space-10": "--space-10",
  "space-12": "--space-12",
  "space-14": "--space-14",
  "duration-fast": "--duration-fast",
  "duration-standard": "--duration-standard",
  "duration-slow": "--duration-slow",
  "duration-hero": "--duration-hero",
  "easing-lamborghini": "--easing-lamborghini",
  "easing-spring": "--easing-spring",
  "stagger-tight": "--stagger-tight",
  "stagger-standard": "--stagger-standard",
  "stagger-section": "--stagger-section",
};

export function buildThemeCss(tokens: Record<string, string>): string {
  const lines: string[] = [":root {"];
  for (const [tokenKey, cssVar] of Object.entries(TOKEN_TO_CSS_VAR)) {
    const value = tokens[tokenKey];
    if (value !== undefined && value !== null && value !== "") {
      lines.push(`  ${cssVar}: ${value};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

export const DEFAULT_TOKENS: Record<string, string> = {
  "color-primary-gold": "#FFC000",
  "color-primary-gold-hover": "#917300",
  "color-primary-gold-text": "#FFCE3E",
  "color-accent-cyan": "#29ABE2",
  "color-accent-link-blue": "#3860BE",
  "color-accent-teal-action": "#1EAEDB",
  "color-semantic-success": "#1EAEDB",
  "color-semantic-error": "#FF3B30",
  "color-semantic-warning": "#FF9500",
  "color-semantic-info": "#29ABE2",
  "color-surface-level0": "#000000",
  "color-surface-level1": "#181818",
  "color-surface-level2": "#202020",
  "color-surface-level3": "rgba(0,0,0,0.7)",
  "color-surface-level4": "rgba(0,0,0,0.5)",
  "color-surface-level5": "rgba(0,0,0,0.25)",
  "color-border-primary": "rgba(255,255,255,0.5)",
  "color-border-secondary": "#202020",
  "color-border-focus": "#000000",
  "font-family-display": '"LamboType", "Roboto", "Helvetica Neue", Arial, sans-serif',
  "font-family-ui": '"LamboType", "Open Sans", ui-sans-serif, system-ui, sans-serif',
  "font-family-mono": 'SF Mono, Monaco, "Courier New", monospace',
  "font-size-hero": "clamp(54px, 12vw, 120px)",
  "font-size-display2": "clamp(40px, 8vw, 80px)",
  "font-size-display3": "clamp(32px, 6vw, 54px)",
  "font-size-display4": "clamp(28px, 5vw, 40px)",
  "font-size-feature": "clamp(20px, 3vw, 27px)",
  "font-size-card-title": "clamp(18px, 2.5vw, 24px)",
  "font-size-body-large": "clamp(16px, 2vw, 18px)",
  "font-size-body": "clamp(14px, 1.5vw, 16px)",
  "font-size-body-small": "clamp(12px, 1vw, 14px)",
  "font-size-caption": "clamp(11px, 1vw, 14px)",
  "space-4": "8px",
  "space-6": "12px",
  "space-8": "16px",
  "space-10": "24px",
  "space-12": "40px",
  "space-14": "56px",
  "duration-fast": "150ms",
  "duration-standard": "250ms",
  "duration-slow": "350ms",
  "duration-hero": "1200ms",
  "easing-lamborghini": "cubic-bezier(0.22, 1, 0.36, 1)",
  "easing-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "stagger-tight": "0.04s",
  "stagger-standard": "0.08s",
  "stagger-section": "0.16s",
};

export const DEFAULT_SECTIONS: SiteSection[] = [
  {
    key: "cover",
    label: "Cover Entrance",
    kind: "hero",
    sort: 10,
    enabled: true,
    content: {
      headline: "HABIBI",
      subheadline: "COME TO HABIBI",
      cta: { label: "SHOP NOW", href: "/shop" },
      background: "/hero/hero-cover.svg",
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "panels",
    label: "Hero Panels",
    kind: "panels",
    sort: 20,
    enabled: true,
    content: {
      panels: [
        { index: 0, title: "WOMEN", slug: "women", image: "/hero/women.svg", color: "#FFC000" },
        { index: 1, title: "MEN", slug: "men", image: "/hero/men.svg", color: "#29ABE2" },
        { index: 2, title: "KIDS", slug: "kids", image: "/hero/kids.svg", color: "#1EAEDB" },
      ],
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "statement",
    label: "Brand Statement",
    kind: "statement",
    sort: 30,
    enabled: true,
    content: {
      title: "CRAFTED FOR THE FEW WHO DARE",
      body: "Every piece begins in the atelier — hand-cut, hand-stitched, finished with obsession. No compromise. No shortcuts. Just the quiet confidence of knowing you wear the exceptional.",
      cta: { label: "OUR STORY", href: "/about" },
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "new-arrivals",
    label: "New Arrivals",
    kind: "grid",
    sort: 40,
    enabled: true,
    content: {
      title: "NEW ARRIVALS",
      subtitle: "Fresh drops, limited quantities",
      section: "women",
      limit: 8,
      showViewAll: true,
      viewAllHref: "/shop?section=women&sort=newest",
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "category",
    label: "Category Showcase",
    kind: "split",
    sort: 50,
    enabled: true,
    content: {
      title: "SHOP BY CATEGORY",
      items: [
        { title: "MEN", slug: "men", image: "/hero/men.svg", description: "Tailored essentials & modern classics" },
        { title: "WOMEN", slug: "women", image: "/hero/women.svg", description: "Effortless elegance, redefined" },
        { title: "KIDS", slug: "kids", image: "/hero/kids.svg", description: "Mini styles, major attitude" },
      ],
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "occasion",
    label: "Occasions",
    kind: "grid",
    sort: 60,
    enabled: true,
    content: {
      title: "SHOP BY OCCASION",
      items: [
        { title: "WEDDING", slug: "wedding", image: "/occasions/wedding.svg" },
        { title: "PARTY", slug: "party", image: "/occasions/party.svg" },
        { title: "CASUAL", slug: "casual", image: "/occasions/casual.svg" },
        { title: "FORMAL", slug: "formal", image: "/occasions/formal.svg" },
      ],
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "sale",
    label: "Sale Promotion",
    kind: "split",
    sort: 70,
    enabled: true,
    content: {
      title: "SEASONAL SALE",
      subtitle: "Up to 50% off selected styles",
      cta: { label: "SHOP SALE", href: "/sale" },
      image: "/hero/sale-banner.svg",
      badge: "LIMITED TIME",
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "craft",
    label: "Craft Heritage",
    kind: "statement",
    sort: 80,
    enabled: true,
    content: {
      title: "THE ART OF MAKING",
      body: "From the first sketch to the final press, every garment passes through 47 pairs of hands. This is not manufacturing. This is heritage in motion.",
      image: "/craft/atelier.svg",
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "testimonials",
    label: "Testimonials",
    kind: "carousel",
    sort: 90,
    enabled: true,
    content: {
      title: "WHAT OUR CLIENTS SAY",
      items: [
        { quote: "The fit is impeccable. I have never worn anything that feels this precise.", author: "A. Rahman", role: "Founder, A.R. Collective" },
        { quote: "Habibi understands the modern gentleman. Sharp, comfortable, timeless.", author: "S. Khan", role: "Creative Director" },
        { quote: "My go-to for every occasion. The quality speaks for itself.", author: "M. Hassan", role: "Architect" },
      ],
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "trust",
    label: "Trust Badges",
    kind: "trust",
    sort: 100,
    enabled: true,
    content: {
      items: [
        { icon: "shield", title: "AUTHENTICITY GUARANTEED", description: "Every piece verified" },
        { icon: "truck", title: "FREE SHIPPING", description: "On orders over ৳5000" },
        { icon: "rotate-ccw", title: "EASY RETURNS", description: "30 days, no questions" },
        { icon: "lock", title: "SECURE PAYMENT", description: "SSL encrypted checkout" },
      ],
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "instagram",
    label: "Instagram Feed",
    kind: "instagram",
    sort: 110,
    enabled: true,
    content: {
      title: "HABIBI IN THE WILD",
      handle: "@habibi",
      limit: 6,
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: "newsletter",
    label: "Newsletter Signup",
    kind: "newsletter",
    sort: 120,
    enabled: true,
    content: {
      title: "JOIN THE INNER CIRCLE",
      subtitle: "Early access, exclusive drops, and the stories behind the stitches.",
      placeholder: "your@email.com",
      button: "SUBSCRIBE",
      privacyNote: "We respect your inbox. Unsubscribe anytime.",
    },
    styles: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];