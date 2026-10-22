import { CONTENT, rec, str } from "@/lib/content";

/**
 * Injects the editable design system as CSS custom properties on `:root`.
 *
 * Sources (all plain text, all under `content/`):
 *   content/theme.txt              colors · fonts · global ease · spotlight
 *   content/design/layout.txt      page width · spacing · grid
 *   content/design/typography.txt  type scale · weights · tracking
 *   content/design/shapes.txt      radius · borders · ratios
 *   content/design/elevation.txt   shadows · glows
 *   content/design/backgrounds.txt section backgrounds · overlays
 *   content/design/layers.txt      z-index stack
 *   content/motion/global.txt      durations · easings · stagger
 *   content/motion/effects.txt     per-effect animation settings
 *   content/assets/*.txt           image paths exposed as --asset-*
 *
 * Server component — rendered once before first paint (no flash).
 */
export function ThemeStyle() {
  const t = CONTENT.theme;
  const c = rec(t.color);
  const f = rec(t.font);
  const e = rec(t.ease);
  const m = rec(t.marquee);
  const s = rec(t.spotlight);

  const layout = CONTENT.design.layout;
  const type = CONTENT.design.typography;
  const shapes = CONTENT.design.shapes;
  const elevation = CONTENT.design.elevation;
  const backgrounds = CONTENT.design.backgrounds;
  const layers = CONTENT.design.layers;
  const motion = CONTENT.motion.global;
  const fx = CONTENT.motion.effects;
  const brand = CONTENT.assets.brand;
  const bgImages = CONTENT.assets.backgrounds;

  const v = (map: Record<string, unknown>, key: string, fallback: string) =>
    str(map[key]) || fallback;

  const vars: Record<string, string> = {
    /* ── Colors ──────────────────────────────────────────────────────── */
    "--color-black": str(c.black) || "#000000",
    "--color-gold": str(c.gold) || "#FFC000",
    "--color-gold-dark": str(c.goldDark) || "#917300",
    "--color-gold-text": str(c.goldText) || "#FFCE3E",
    "--color-blush": str(c.blush) || "#F2CCC3",
    "--color-clay": str(c.clay) || "#A93A24",
    "--color-paper": str(c.paper) || "#FBF6F3",
    "--color-smoke": str(c.smoke) || "#F5F5F5",
    "--color-steel": str(c.steel) || "#969696",
    "--color-ash": str(c.ash) || "#7D7D7D",
    "--color-graphite": str(c.graphite) || "#494949",
    "--color-charcoal": str(c.charcoal) || "#202020",
    "--color-dark-iron": str(c.darkIron) || "#181818",
    "--color-burgundy": str(c.burgundy) || "#3a0a0f",
    "--color-burgundy-light": str(c.burgundyLight) || "#5a1a2e",
    "--color-champagne-gold": str(c.champagneGold) || "#EAB54F",
    "--color-border": v(c, "border", "rgba(255,255,255,0.12)"),
    "--color-focus": v(c, "focus", "#FFD600"),
    "--color-overlay": v(c, "overlay", "rgba(0,0,0,0.55)"),
    "--color-success": v(c, "success", "#2FBF71"),
    "--color-error": v(c, "error", "#E5484D"),
    "--color-warning": v(c, "warning", "#F5A524"),
    "--color-info": v(c, "info", "#29ABE2"),
    "--abrar-accent": str(c.goldBright) || "#FFD600",
    "--abrar-surface": str(c.surface) || "#0d0d0d",
    "--abrar-ink": str(c.ink) || "#172121",

    /* ── Fonts + type scale ──────────────────────────────────────────── */
    "--font-display": str(f.display) || `"LamboType", "Roboto", sans-serif`,
    "--font-ui": str(f.ui) || `"LamboType", "Open Sans", sans-serif`,
    "--font-serif": str(f.serif) || `"Cormorant Garamond", Georgia, serif`,
    "--font-mono": str(f.mono) || `"SF Mono", Monaco, monospace`,
    "--abrar-font-serif": str(f.serif) || `"Cormorant Garamond", Georgia, serif`,
    "--text-hero": v(type, "size.hero", "clamp(54px, 12vw, 120px)"),
    "--text-display-1": v(type, "size.display1", "clamp(40px, 8vw, 80px)"),
    "--text-display-2": v(type, "size.display2", "clamp(32px, 6vw, 54px)"),
    "--text-display-3": v(type, "size.display3", "clamp(28px, 5vw, 40px)"),
    "--text-display-4": v(type, "size.display4", "clamp(22px, 4vw, 30px)"),
    "--text-feature": v(type, "size.feature", "clamp(20px, 3vw, 27px)"),
    "--text-card-title": v(type, "size.cardTitle", "clamp(18px, 2.5vw, 24px)"),
    "--text-body-large": v(type, "size.bodyLarge", "clamp(16px, 2vw, 18px)"),
    "--text-body": v(type, "size.body", "clamp(14px, 1.5vw, 16px)"),
    "--text-body-small": v(type, "size.bodySmall", "clamp(12px, 1vw, 14px)"),
    "--text-caption": v(type, "size.caption", "clamp(11px, 1vw, 14px)"),
    "--weight-light": v(type, "weight.light", "300"),
    "--weight-regular": v(type, "weight.regular", "400"),
    "--weight-medium": v(type, "weight.medium", "500"),
    "--weight-semibold": v(type, "weight.semibold", "600"),
    "--weight-bold": v(type, "weight.bold", "700"),
    "--leading-tight": v(type, "line.tight", "1.05"),
    "--leading-normal": v(type, "line.normal", "1.5"),
    "--leading-loose": v(type, "line.loose", "1.8"),
    "--tracking-tight": v(type, "tracking.tight", "-0.02em"),
    "--tracking-normal": v(type, "tracking.normal", "0.02em"),
    "--tracking-wide": v(type, "tracking.wide", "0.14em"),
    "--tracking-kicker": v(type, "tracking.kicker", "0.22em"),

    /* ── Layout ──────────────────────────────────────────────────────── */
    "--layout-max": v(layout, "container.max", "1440px"),
    "--layout-pad-x": v(layout, "container.padX", "20px"),
    "--section-pad-y": v(layout, "section.padY", "96px"),
    "--section-pad-y-mobile": v(layout, "section.padYmobile", "56px"),
    "--grid-columns": v(layout, "grid.columns", "12"),
    "--grid-gap": v(layout, "grid.gap", "24px"),
    "--header-height": v(layout, "header.height", "68px"),
    "--announcement-height": v(layout, "announcement.height", "32px"),
    "--footer-pad-y": v(layout, "footer.padY", "64px"),
    "--drawer-width": v(layout, "drawer.width", "420px"),
    "--menu-max": v(layout, "menu.max", "1200px"),

    /* ── Shapes ──────────────────────────────────────────────────────── */
    "--radius-xs": v(shapes, "radius.xs", "2px"),
    "--radius-sm": v(shapes, "radius.sm", "4px"),
    "--radius-md": v(shapes, "radius.md", "8px"),
    "--radius-lg": v(shapes, "radius.lg", "16px"),
    "--radius-pill": v(shapes, "radius.pill", "999px"),
    "--border-width": v(shapes, "border.width", "1px"),
    "--border-style": v(shapes, "border.style", "solid"),
    "--card-aspect": v(shapes, "card.aspect", "3/4"),
    "--button-height": v(shapes, "button.height", "44px"),
    "--input-height": v(shapes, "input.height", "44px"),
    "--divider-width": v(shapes, "divider.width", "1px"),
    "--panel-rounding": v(shapes, "panel.rounding", "0px"),
    "--image-rounding": v(shapes, "image.rounding", "0px"),

    /* ── Elevation ───────────────────────────────────────────────────── */
    "--shadow-card": v(elevation, "shadow.card", "0 8px 24px rgba(0,0,0,0.35)"),
    "--shadow-hover": v(elevation, "shadow.hover", "0 24px 48px rgba(0,0,0,0.45)"),
    "--shadow-menu": v(elevation, "shadow.menu", "0 20px 60px rgba(0,0,0,0.60)"),
    "--shadow-drawer": v(elevation, "shadow.drawer", "-24px 0 60px rgba(0,0,0,0.60)"),
    "--shadow-modal": v(elevation, "shadow.modal", "0 24px 80px rgba(0,0,0,0.70)"),
    "--glow-gold": v(elevation, "glow.gold", "0 0 24px rgba(255,214,0,0.35)"),
    "--glow-soft": v(elevation, "glow.soft", "0 0 40px rgba(255,255,255,0.08)"),

    /* ── Backgrounds + images ────────────────────────────────────────── */
    "--bg-page": v(backgrounds, "page.color", str(c.black) || "#000000"),
    "--bg-header": v(backgrounds, "header.color", str(c.black) || "#000000"),
    "--bg-footer": v(backgrounds, "footer.color", str(c.darkIron) || "#0d0d0d"),
    "--bg-section": v(backgrounds, "section.color", str(c.black) || "#000000"),
    "--bg-card": v(backgrounds, "card.color", str(c.surface) || "#0d0d0d"),
    "--bg-overlay": v(backgrounds, "overlay.color", "rgba(0,0,0,0.55)"),
    "--bg-overlay-soft": v(backgrounds, "overlay.soft", "rgba(0,0,0,0.30)"),
    "--bg-gradient-hero": v(backgrounds, "gradient.hero", "none"),
    "--bg-gradient-sale": v(backgrounds, "gradient.sale", "none"),
    "--grain-opacity": v(backgrounds, "grain.opacity", "0.05"),
    "--bg-image-page": a(bgImages, "page.image"),
    "--bg-image-header": a(bgImages, "header.image"),
    "--bg-image-footer": a(bgImages, "footer.image"),
    "--bg-image-cover": a(bgImages, "cover.image"),
    "--bg-image-sale": a(bgImages, "sale.image"),
    "--bg-image-craft": a(bgImages, "craft.image"),
    "--bg-image-loader": a(bgImages, "loader.image"),

    /* ── Layer stack ─────────────────────────────────────────────────── */
    "--z-base": v(layers, "base", "0"),
    "--z-content": v(layers, "content", "10"),
    "--z-sticky": v(layers, "sticky", "20"),
    "--z-header": v(layers, "header", "30"),
    "--z-menu": v(layers, "menu", "40"),
    "--z-drawer": v(layers, "drawer", "50"),
    "--z-overlay": v(layers, "overlay", "60"),
    "--z-modal": v(layers, "modal", "70"),
    "--z-toast": v(layers, "toast", "75"),
    "--z-cursor": v(layers, "cursor", "78"),
    "--z-grain": v(layers, "grain", "80"),
    "--z-loader": v(layers, "loader", "90"),

    /* ── Motion ──────────────────────────────────────────────────────── */
    "--ease-lux": str(e.lux) || "cubic-bezier(0.22, 1, 0.36, 1)",
    "--ease-standard": v(motion, "ease.standard", "cubic-bezier(0.22, 1, 0.36, 1)"),
    "--ease-enter": v(motion, "ease.enter", "cubic-bezier(0.22, 1, 0.36, 1)"),
    "--ease-exit": v(motion, "ease.exit", "cubic-bezier(0.4, 0, 1, 1)"),
    "--ease-spring": v(motion, "ease.spring", "cubic-bezier(0.34, 1.56, 0.64, 1)"),
    "--dur-instant": v(motion, "duration.instant", "100ms"),
    "--dur-fast": v(motion, "duration.fast", "200ms"),
    "--dur-base": v(motion, "duration.base", "350ms"),
    "--dur-slow": v(motion, "duration.slow", "600ms"),
    "--dur-hero": v(motion, "duration.hero", "900ms"),
    "--stagger-tight": v(motion, "stagger.tight", "0.04"),
    "--stagger-base": v(motion, "stagger.base", "0.08"),
    "--stagger-section": v(motion, "stagger.section", "0.16"),
    "--fx-hero-entry": v(fx, "hero.entryDuration", "0.6"),
    "--fx-hero-stagger": v(fx, "hero.stagger", "0.08"),
    "--fx-hero-hover": v(fx, "hero.hoverDuration", "0.4"),
    "--fx-hero-parallax": v(fx, "hero.parallaxMax", "24"),
    "--fx-hero-zoom": v(fx, "hero.zoom", "0.54"),
    "--fx-reveal-duration": v(fx, "reveal.duration", "0.7"),
    "--fx-reveal-distance": v(fx, "reveal.distance", "24"),
    "--fx-reveal-stagger": v(fx, "reveal.stagger", "0.08"),
    "--fx-parallax-max": v(fx, "parallax.max", "24"),
    "--fx-marquee-speed": v(fx, "marquee.speed", str(m.speed) || "58s"),
    "--fx-loader-min": v(fx, "loader.minDuration", "400ms"),
    "--fx-loader-max": v(fx, "loader.maxWait", "6000ms"),
    "--fx-cursor-lerp": v(fx, "cursor.lerp", "0.18"),
    "--fx-cursor-size": v(fx, "cursor.size", "40px"),
    "--fx-magnetic": v(fx, "magnetic.strength", "0.35"),
    "--abrar-marquee-speed": str(m.speed) || "58s",

    /* ── Spotlight ───────────────────────────────────────────────────── */
    "--spotlight-base": str(s.base) || "#010101",
    "--spotlight-core": str(s.core) || "255, 248, 150",
    "--spotlight-mid": str(s.mid) || "255, 230, 0",
    "--spotlight-outer": str(s.outer) || "255, 185, 0",

    /* ── Brand assets ────────────────────────────────────────────────── */
    "--asset-logo": a(brand, "logo", "/logo.svg"),
    "--asset-monogram": a(brand, "monogram", "/hero/icons/icon-512.png"),
    "--asset-logo-alt": a(brand, "logoAlt", "ABRAR"),
  };

  const css = `:root{${Object.entries(vars)
    .map(([k, val]) => `${k}:${val}`)
    .join(";")}}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function a(map: Record<string, string>, key: string, fallback = "none"): string {
  const value = str(map[key]);
  return value ? `url("${value}")` : fallback;
}
