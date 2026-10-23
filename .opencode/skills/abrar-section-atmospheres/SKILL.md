---
name: abrar-section-atmospheres
description: Reusable per-section cinematic background atmosphere system — unique palette, geometry, light source, and GSAP ScrollTrigger lighting timeline per section, with reduced-motion and mobile fallbacks.
---

# Section Atmospheres — System

Every section owns a **distinct** background atmosphere. Never reuse one generic
golden radial gradient across sections. Each section independently defines its
own palette, geometry, light source, highlight, scroll behaviour, and fallback.

## When to use

- Product launch / editorial / e-commerce home surfaces that scroll long.
- Any page where sections should feel like distinct cinematic environments
  ("13 environments, not 13 variations of one gradient").
- NOT for a single hero-only effect; NOT for content/layout logic.

## Non-negotiables

- Atmosphere is decorative: `pointer-events: none`, `aria-hidden="true"`.
- It must sit **behind** content (`z-index: -1` under an `isolation: isolate`
  section; use the `overlay` variant — `z-index: 0` — only when the layer must
  tint an existing photograph, e.g. the hero cover).
- Animate only `transform` and `opacity` (plus GSAP-driven CSS custom
  properties consumed by pseudo-elements). Never `width/height/top/left`.
- Respect `prefers-reduced-motion` (static base) and `(pointer: coarse)`
  (static base on touch).
- Layer budget per section: base + up to 4 light layers + 1 grain. At most one
  `mix-blend-mode` and no `backdrop-filter`, `background-attachment: fixed`, or
  large `filter: blur()` (>24px) in an atmosphere layer.

## Config schema (per section)

- `preset` — one of the 13 registered keys: `hero`, `audience`, `statement`,
  `arrivals`, `categories`, `occasions`, `sale`, `story`, `testimonials`,
  `trust`, `drop`, `newsletter`, `footer`.
- `variant` — `behind` (default) | `overlay`.
- Layers rendered by the component (all optional per preset):
  `base` (solid/atmosphere colour), `a` `b` `c` `d` (light geometry),
  `grain` (texture).

Markup contract:

```html
<section data-atmosphere="statement">
  <div class="atmo atmo--statement" aria-hidden="true">
    <span class="atmo__base"></span>
    <span class="atmo__a"></span>
    <span class="atmo__b"></span>
    <span class="atmo__c"></span>
    <span class="atmo__d"></span>
    <span class="atmo__grain"></span>
  </div>
  <!-- existing content, unchanged -->
</section>
```

## 13 presets

| key | concept | light source | highlight |
|---|---|---|---|
| hero | golden silk, vertical shafts | top-centre | warm gold |
| audience | black runway, 3 overhead spotlights | 20/50/80% top | warm white |
| statement | matte black, one diagonal champagne beam | upper-left | champagne |
| arrivals | obsidian, elliptical halos under cards | above rail | soft gold |
| categories | architectural gallery, geometric shafts | staggered | gold |
| occasions | 4 lighting zones (Eid/Wedding/Everyday/Winter) | per column | gold/burgundy/ivory/bronze |
| sale | burgundy-black, amber streaks, pulses | off-axis | amber |
| story | bronze woven texture, moving ambient | centre drift | bronze |
| testimonials | charcoal, warm edge lighting | left+right | warm |
| trust | dark metallic, fine gold lines | sweep | gold |
| drop | editorial black, teal/gold alternate | per tile | teal+gold |
| newsletter | golden sunrise that grows on entry | bottom-centre | sunrise gold |
| footer | obsidian, bronze grain, minimal | faint band | bronze |

## Motion & accessibility

- One scrub ScrollTrigger per section: `start: "top bottom"`, `end: "bottom top"`.
- Timeline maps 0 → enter (reveal atmosphere), 0.5 → centre (max intensity),
  1 → exit (dim to hand off to next section).
- Idle loops (drift/flicker) are CSS keyframes gated by `.atmo--live`, toggled
  by an IntersectionObserver so nothing animates off-screen.
- Under `prefers-reduced-motion` or `(pointer: coarse)`: add `.atmo--static`;
  CSS renders a static base and removes all animation.
- Keep text contrast AA against the brightest layer.

## Implementation checklist

- [ ] Add `data-atmosphere="<preset>"` + `<SectionAtmosphere preset="<preset>" />`
      as the first child (or after media overlays for `overlay`).
- [ ] Ensure the section is `position: relative` (`[data-atmosphere]` adds it).
- [ ] Register the preset in `SectionAtmosphere` (`PRESETS` map).
- [ ] Add the preset's CSS in `atmospheres.css`.
- [ ] Confirm no other rule overrides the section background.
- [ ] Verify typecheck + lint + build pass; verify reduced-motion + mobile.

## Do / Don't

- DO keep content, text, cards, images, and layout untouched.
- DO give each section its own palette, geometry, light source, and behaviour.
- DON'T animate layout properties or add per-frame reads beyond ScrollTrigger.
- DON'T put atmosphere above content or intercept pointer events.
- DON'T ship 13 identical gradients with different opacity.
