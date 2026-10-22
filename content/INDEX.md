# Content Map — edit every part of the site from plain text

This folder is the **single control room** for the storefront. Nothing here is
code: every file is `key = value` plain text. Change the value after `=`, save,
then run:

```bash
npm run content
```

(`npm run dev` and `npm run build` run it automatically.)

> **Rules:** lines starting with `#` are instructions (ignored). In the copy
> files (`home.txt`, `site.txt`, `pages/*`) keys with dots group data
> (`hero.panel.1.title`). In `assets/`, `design/`, `motion/` and `scripts/`
> dotted keys are **literal token names** (`hero.entryDuration`). Images are
> paths under `/public` (e.g. `/hero/women.jpg`). Tokens `{name}`, `{email}`,
> `{phone}`, `{tagline}`, `{supportHours}` are auto-filled from `site.txt`.

---

## 1. Where everything lives

| Folder / file | Controls | Edit when you want to change… |
|---|---|---|
| `site.txt` | Brand identity | name, tagline, bio, phone, email, socials |
| `announcement.txt` | Top strip | the 3 rotating messages |
| `home.txt` | Homepage copy | every headline, paragraph, CTA, panel, testimonial |
| `theme.txt` | Colors + fonts | palette, font families, overlays, spotlight |
| `pages/*.txt` | Inner pages | about, contact, faq, craft, stories, legal, sizes |
| **`assets/`** | **Images (png · jpg · svg · ico)** | logos, favicons, hero, categories, occasions, products |
| **`design/`** | **Design system** | layout, type scale, shapes, shadows, backgrounds, layers |
| **`motion/`** | **Animation** | durations, easings, stagger, per-effect settings |
| **`scripts/`** | **Script switches** | turn smooth-scroll/cursor/loader/PWA on or off |
| `src/locales/*.json` | UI labels (EN + বাংলা) | cart, checkout, account, buttons |
| Supabase | Products / orders / stock | product names, prices, photos (Admin panel) |

Generated output: `content/*.txt` → `src/lib/content.generated.ts` →
`src/lib/content.ts` → `src/components/theme-style.tsx` → live CSS variables.

---

## 2. Step-by-step: edit any minor part

### Change an image (PNG / JPG / SVG / ICO)
1. Put the new file in `public/` (e.g. `public/library/women.png`).
2. Open `content/assets/brand.txt`, `hero.txt`, `categories.txt`,
   `occasions.txt`, `products.txt`, or `backgrounds.txt`.
3. Change the path after `=` (e.g. `panel.women.tile = /library/women.png`).
4. Save → `npm run content`.

Product photos are **not** in this folder — upload them in
**Admin → Products** (they live in Supabase, files go in `public/products/`).

### Change text
- Homepage → `home.txt`
- Brand / contact / socials → `site.txt`
- Inner page → `pages/<page>.txt`
- Buttons & cart labels → `src/locales/en.json` / `bn.json`

### Change a font
`theme.txt`:
```ini
font.display = "Your Font", Arial, sans-serif
font.ui      = "Your Font", sans-serif
font.serif   = "Cormorant Garamond", Georgia, serif
font.mono    = "SF Mono", monospace
```
Add the `<link>` in `src/app/layout.tsx` if the font is hosted (Google Fonts)
or place the file in `public/fonts/` and use `@font-face` in `globals.css`.

### Change font sizes / weights / spacing
`design/typography.txt` — `size.hero`, `size.display1…4`, `size.body`,
`weight.*`, `line.*`, `tracking.*`.

### Change a colour
`theme.txt` → `color.*`. Examples: `color.black` (page), `color.gold`
(accent), `color.focus` (focus ring), `color.success/error` (form states).

### Change a shape (radius / borders / ratio)
`design/shapes.txt` → `radius.sm/md/lg/pill`, `border.width`, `card.aspect`,
`button.height`, `input.height`, `panel.rounding`.

### Change a background
- **Colour / gradient / overlay:** `design/backgrounds.txt`
  (`page.color`, `header.color`, `footer.color`, `section.color`,
  `card.color`, `overlay.color`, `gradient.hero`, `grain.opacity`).
- **Image:** `assets/backgrounds.txt` (`cover.image`, `sale.image`, `craft.image`…).

### Change a layer (what sits on top)
`design/layers.txt` → `header`, `menu`, `drawer`, `modal`, `cursor`, `grain`,
`loader`. Higher number = closer to the viewer.

### Change animation
- **Global timing:** `motion/global.txt` → `duration.*`, `ease.*`,
  `stagger.*`, `gsap.ease`.
- **Specific effect:** `motion/effects.txt` → `hero.*`, `reveal.*`,
  `parallax.*`, `marquee.speed`, `loader.*`, `cursor.*`, `category.*`,
  `spotlight.*`, `smooth.lerp`.
- **Reduced motion:** `motion/global.txt` → `reducedMotion = respect`.

### Turn a script / feature on or off
`scripts/features.txt` → `smoothScroll`, `spotlight`, `cursorRing`,
`brandLoader`, `particleInspector`, `serviceWorker`, `tabRefresh`,
`searchPalette`, `occasionEffects`, `microFx`, `whatsappOrder`.
Set to `false` to disable without deleting code.

---

## 3. Token reference (quick lookup)

### `theme.txt` — colours + fonts
| Key | Used for |
|---|---|
| `color.black` | page / header / footer base |
| `color.gold` · `goldBright` · `goldDark` · `goldText` | accent family |
| `color.blush` · `clay` · `paper` | warm surfaces / CTA text |
| `color.ink` · `smoke` · `steel` · `ash` · `graphite` | text + glass |
| `color.charcoal` · `darkIron` · `surface` | cards / footer / tiles |
| `color.border` · `focus` · `overlay` | hairlines / focus / dim layer |
| `color.success` · `error` · `warning` · `info` | form + order states |
| `font.display` · `ui` · `serif` · `mono` | font families |
| `ease.lux` | legacy site-wide easing |
| `marquee.speed` | ticker speed |
| `spotlight.base/core/mid/outer` | scroll spotlight colours |

### `design/layout.txt`
`container.max`, `container.padX`, `section.padY`, `section.padYmobile`,
`grid.columns`, `grid.gap`, `header.height`, `announcement.height`,
`footer.padY`, `drawer.width`, `menu.max`.

### `design/typography.txt`
`size.*`, `weight.*`, `line.*`, `tracking.*`.

### `design/shapes.txt`
`radius.*`, `border.width`, `border.style`, `card.aspect`, `button.height`,
`input.height`, `divider.width`, `panel.rounding`, `image.rounding`.

### `design/elevation.txt`
`shadow.card`, `shadow.hover`, `shadow.menu`, `shadow.drawer`, `shadow.modal`,
`glow.gold`, `glow.soft`.

### `design/backgrounds.txt`
`page.color`, `header.color`, `footer.color`, `section.color`, `card.color`,
`overlay.color`, `overlay.soft`, `gradient.hero`, `gradient.sale`,
`grain.opacity`.

### `design/layers.txt`
`base`, `content`, `sticky`, `header`, `menu`, `drawer`, `overlay`, `modal`,
`toast`, `cursor`, `grain`, `loader`.

### `motion/global.txt`
`duration.instant/fast/base/slow/hero`, `ease.standard/enter/exit/spring`,
`gsap.ease`, `stagger.tight/base/section`, `reducedMotion`.

### `motion/effects.txt`
`hero.entryDuration/stagger/hoverDuration/parallaxMax/zoom`,
`reveal.duration/distance/start/stagger`, `parallax.max`, `marquee.speed`,
`loader.minDuration/maxWait`, `cursor.lerp/size`, `magnetic.strength`,
`smooth.lerp`, `category.hoverGrow/othersGrow/duration`,
`spotlight.maxRadiusFactor/minRadius`.

### `scripts/features.txt`
`true` / `false` switches (see §2).

---

## 4. How the value reaches the screen

```
content/*.txt
      │  npm run content
      ▼
src/lib/content.generated.ts
      │  deep-merged with safe DEFAULTS
      ▼
src/lib/content.ts  ──►  components (text, images, motion numbers)
      │
      ▼
src/components/theme-style.tsx  ──►  CSS variables on :root
      │
      ▼
src/app/editable.css  ──►  body / header / footer / sections / animations
```

- If you delete a key, the site still renders: `src/lib/content.ts` keeps a
  hardcoded fallback for every value.
- CSS variables emitted include `--color-*`, `--font-*`, `--text-*`,
  `--radius-*`, `--shadow-*`, `--bg-*`, `--z-*`, `--dur-*`, `--ease-*`,
  `--fx-*`, `--asset-*`.
- Components read the same values through `asset()`, `designValue()`,
  `motionValue()`, `motionNumber()`, `feature()`.

---

## 5. Safety checklist

1. Keep the `key =` part unchanged; edit only the value.
2. Use paths that start with `/` (relative to `public/`).
3. Run `npm run content` after edits.
4. `npm run typecheck` if you touched `.ts/.tsx`.
5. Never delete `content.generated.ts` — it is rebuilt for you.
