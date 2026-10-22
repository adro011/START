/**
 * retheme.mjs — replaces hardcoded hex colors + hardcoded serif font stacks
 * across the storefront source with CSS custom properties, so every color and
 * font is editable from `content/theme.txt` (via the ThemeStyle injection).
 *
 * This is a one-off migration utility; run it from the repo root:
 *   node scripts/retheme.mjs
 *
 * Rules:
 *   - Fonts: any `fontFamily` value containing "Cormorant Garamond" or
 *     "Playfair Display" becomes `fontFamily: "var(--abrar-font-serif)"`.
 *   - Colors: replace the exact 6-char hex (NOT followed by `/` = opacity
 *     modifier, and NOT part of a longer hex) with its CSS variable.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

const SKIP = new Set([
  "content.ts",
  "content.generated.ts",
  "site-content.ts",
  "site-content-utils.ts",
  "particles.ts",
  "site.ts",
  "theme-style.tsx",
  "content-blocks.tsx",
]);

const HEX_MAP = {
  "#FFD600": "var(--abrar-accent)",
  "#FFC000": "var(--color-gold)",
  "#F2CCC3": "var(--color-blush)",
  "#A93A24": "var(--color-clay)",
  "#FBF6F3": "var(--color-paper)",
  "#172121": "var(--abrar-ink)",
  "#0d0d0d": "var(--abrar-surface)",
  "#181818": "var(--color-dark-iron)",
  "#202020": "var(--color-charcoal)",
  "#F5F5F5": "var(--color-smoke)",
  "#969696": "var(--color-steel)",
  "#7D7D7D": "var(--color-ash)",
  "#494949": "var(--color-graphite)",
  "#000000": "var(--color-black)",
};

const FONT_RE = /fontFamily:\s*['"][^'"]*(Cormorant\s*Garamond|Playfair\s*Display)[^'"]*['"]/g;

function collect(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) collect(full, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(full);
  }
  return out;
}

function transform(code) {
  let out = code.replace(FONT_RE, 'fontFamily: "var(--abrar-font-serif)"');
  for (const [hex, v] of Object.entries(HEX_MAP)) {
    // skip opacity modifiers (hex followed by /) and longer hex runs
    const re = new RegExp(hex + "(?!/)(?![0-9A-Fa-f])", "g");
    out = out.replace(re, v);
  }
  return out;
}

let changed = 0;
for (const file of collect(SRC)) {
  const rel = relative(SRC, file).replace(/\\/g, "/");
  if (rel.startsWith("design-system/tokens/")) continue;
  if (SKIP.has(rel.split("/").pop())) continue;
  const before = readFileSync(file, "utf8");
  const after = transform(before);
  if (after !== before) {
    writeFileSync(file, after, "utf8");
    changed++;
    console.log("rethemed:", rel);
  }
}
console.log(`\nDone — ${changed} file(s) changed.`);
