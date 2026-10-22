import { CONTENT, rec, str } from "@/lib/content";

/**
 * Injects the editable design theme (from `content/theme.txt`) as CSS custom
 * properties on `:root`. This makes every color, font, easing and spotlight
 * value editable in plain text without touching CSS or components.
 *
 * Server component — the <style> is rendered once into the body so the tokens
 * resolve before first paint (no flash of unstyled content).
 */
export function ThemeStyle() {
  const t = CONTENT.theme;
  const c = rec(t.color);
  const f = rec(t.font);
  const e = rec(t.ease);
  const m = rec(t.marquee);
  const s = rec(t.spotlight);

  const vars: Record<string, string> = {
    // Colors — override Tailwind @theme tokens + expose extra accent vars.
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
    "--abrar-accent": str(c.goldBright) || "#FFD600",
    "--abrar-surface": str(c.surface) || "#0d0d0d",
    "--abrar-ink": str(c.ink) || "#172121",
    // Fonts
    "--font-display": str(f.display) || `"LamboType", "Roboto", sans-serif`,
    "--font-ui": str(f.ui) || `"LamboType", "Open Sans", sans-serif`,
    "--abrar-font-serif": str(f.serif) || `"Cormorant Garamond", Georgia, serif`,
    // Motion
    "--ease-lux": str(e.lux) || "cubic-bezier(0.22, 1, 0.36, 1)",
    "--abrar-marquee-speed": str(m.speed) || "58s",
    // Spotlight
    "--spotlight-base": str(s.base) || "#010101",
    "--spotlight-core": str(s.core) || "255, 248, 150",
    "--spotlight-mid": str(s.mid) || "255, 230, 0",
    "--spotlight-outer": str(s.outer) || "255, 185, 0",
  };

  const css = `:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
