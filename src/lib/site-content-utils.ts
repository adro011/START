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
  "spotlight-base-black": "--spotlight-base-black",
  "spotlight-core-yellow": "--spotlight-core-yellow",
  "spotlight-mid-yellow": "--spotlight-mid-yellow",
  "spotlight-amber": "--spotlight-amber",
  "spotlight-radius-vh": "--spotlight-radius-vh",
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
  "color-primary-gold": "#FFD600",
  "color-primary-gold-hover": "#FFC000",
  "color-primary-gold-text": "#FFD600",
  "color-accent-cyan": "#29ABE2",
  "color-accent-link-blue": "#3860BE",
  "color-accent-teal-action": "#1EAEDB",
  "color-semantic-success": "#1EAEDB",
  "color-semantic-error": "#FF3B30",
  "color-semantic-warning": "#FF9500",
  "color-semantic-info": "#29ABE2",
  "color-surface-level0": "#010101",
  "color-surface-level1": "#080808",
  "color-surface-level2": "#121212",
  "color-surface-level3": "rgba(1,1,1,0.85)",
  "color-surface-level4": "rgba(1,1,1,0.65)",
  "color-surface-level5": "rgba(1,1,1,0.35)",
  "color-border-primary": "rgba(255,214,0,0.45)",
  "color-border-secondary": "#1A1A1A",
  "color-border-focus": "#FFD600",
  "spotlight-base-black": "#010101",
  "spotlight-core-yellow": "#FFD600",
  "spotlight-mid-yellow": "#FFC000",
  "spotlight-amber": "#CC8800",
  "spotlight-radius-vh": "45vh",
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
      particleId: "home.cover",
      headline: "ABRAR",
      subheadline: "EXCLUSIVE COUTURE & ATELIER",
      cta: { label: "EXPLORE COLLECTION", href: "/shop" },
      background: "/hero/hero-cover.svg",
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.panels",
      panels: [
        { index: 0, title: "WOMEN", slug: "women", image: "/hero/women.svg", color: "#FFD600", particleId: "home.panels.women" },
        { index: 1, title: "MEN", slug: "men", image: "/hero/men.svg", color: "#FFC000", particleId: "home.panels.men" },
        { index: 2, title: "KIDS", slug: "kids", image: "/hero/kids.svg", color: "#CC8800", particleId: "home.panels.kids" },
      ],
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.statement",
      title: "CRAFTED FOR THE FEW WHO DARE",
      body: "Every ABRAR piece begins in the Dhaka atelier — hand-cut, hand-stitched, finished with obsession. No compromise. No shortcuts. Just the quiet confidence of knowing you wear the exceptional.",
      cta: { label: "OUR STORY", href: "/stories" },
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.new_arrivals",
      title: "NEW ARRIVALS",
      subtitle: "Fresh drops, limited quantities",
      section: "women",
      limit: 8,
      showViewAll: true,
      viewAllHref: "/shop?section=women&sort=newest",
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.categories",
      title: "SHOP BY CATEGORY",
      items: [
        { title: "MEN", slug: "men", image: "/hero/men.svg", description: "Tailored panjabis, kurtas & modern classics", particleId: "home.categories.men" },
        { title: "WOMEN", slug: "women", image: "/hero/women.svg", description: "Handloom sharees & effortless elegance", particleId: "home.categories.women" },
        { title: "KIDS", slug: "kids", image: "/hero/kids.svg", description: "Mini styles, major celebration attitude", particleId: "home.categories.kids" },
      ],
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.occasions",
      title: "SHOP BY OCCASION",
      items: [
        { title: "WEDDING", slug: "wedding", image: "/occasions/wedding.svg", particleId: "home.occasions.wedding" },
        { title: "PARTY", slug: "party", image: "/occasions/party.svg", particleId: "home.occasions.party" },
        { title: "CASUAL", slug: "casual", image: "/occasions/casual.svg", particleId: "home.occasions.casual" },
        { title: "FORMAL", slug: "formal", image: "/occasions/formal.svg", particleId: "home.occasions.formal" },
      ],
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.sale",
      title: "SEASONAL SALE",
      subtitle: "Up to 50% off selected ABRAR signature styles",
      cta: { label: "SHOP SALE", href: "/sale" },
      image: "/hero/sale-banner.svg",
      badge: "LIMITED TIME",
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.craft",
      title: "THE ART OF MAKING",
      body: "From the first sketch to the final press, every ABRAR garment passes through 47 pairs of artisan hands. This is not manufacturing. This is heritage in motion.",
      image: "/craft/atelier.svg",
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.testimonials",
      title: "WHAT OUR CLIENTS SAY",
      items: [
        { quote: "The fit is impeccable. I have never worn anything that feels this precise.", author: "A. Rahman", role: "Founder, A.R. Collective", particleId: "home.testimonials.item.0" },
        { quote: "ABRAR understands the modern gentleman. Sharp, comfortable, timeless.", author: "S. Khan", role: "Creative Director", particleId: "home.testimonials.item.1" },
        { quote: "My go-to for every occasion. The quality speaks for itself.", author: "M. Hassan", role: "Architect", particleId: "home.testimonials.item.2" },
      ],
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.trust",
      items: [
        { icon: "shield", title: "AUTHENTICITY GUARANTEED", description: "Every piece verified", particleId: "home.trust.authenticity" },
        { icon: "truck", title: "FREE SHIPPING", description: "On orders over ৳2,500", particleId: "home.trust.shipping" },
        { icon: "rotate-ccw", title: "EASY RETURNS", description: "7 days, no questions", particleId: "home.trust.returns" },
        { icon: "lock", title: "SECURE PAYMENT", description: "SSL encrypted checkout", particleId: "home.trust.security" },
      ],
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.instagram",
      title: "ABRAR IN THE WILD",
      handle: "@abrar.exclusive",
      limit: 6,
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
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
      particleId: "home.newsletter",
      title: "JOIN THE INNER CIRCLE",
      subtitle: "Early access, exclusive drops, and the stories behind the stitches.",
      placeholder: "your@email.com",
      button: "SUBSCRIBE",
      privacyNote: "We respect your inbox. Unsubscribe anytime.",
    },
    styles: {
      backgroundColor: "#010101",
      accentColor: "#FFD600",
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
