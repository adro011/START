---
name: motion-ux
description: Buttery motion language, budgets, and reduced-motion fallbacks.
---

# Motion UX Rules

## Budget
- Ease: `cubic-bezier(0.22,1,0.36,1)`. Durations 200-700ms, stagger 0.05-0.08s.
- Animate ONLY `transform` / `opacity` / `clip-path`. Never width/height/top.
- Targets: CLS < 0.05, INP < 200ms, 60fps, no long frames.

## Smooth scroll
- Lenis site-wide, synced to GSAP ticker. Route change resets scroll.
- Disable Lenis if `prefers-reduced-motion` is set.
- Anchor links use Lenis `scrollTo`, not native jump.

## Reduced motion
- `prefers-reduced-motion`: swap to simple fades, kill parallax/marquee/preloader.
- Preloader: first visit only, <1.2s, skippable, never blocks LCP hero.
- Touch/low-power: disable magnetic buttons, cursor ring, parallax >12px.

## Patterns
- Hero 3-panel (Men/Women/Kids): flex-grow expand, image 1.06→1, others dim 70%.
- Mobile hero: vertical snap or swipe carousel with progress, pause on touch.
- Mega-menu: open ≤220ms clip+opacity, 120ms close delay, stagger links.
- Cart drawer: spring slide-over, items animate in/out, free-ship bar animates.
- Page transitions: View Transitions API shared-element, Framer Motion fallback.

## Loading
- Blur-up placeholders, `loading.tsx` skeletons, branded 404/500.
- Never animate the LCP element's first paint.
