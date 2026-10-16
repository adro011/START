---
name: fashion-ui
description: Editorial Heritage tokens, product UX, and navigation patterns.
---

# Fashion UI Rules

## Tokens
- Palette: `--blush #F2CCC3`, `--terracotta #D5573B`, `--sage #7E9181`, `--ink #172121`, `--umber #7D451B`, `--paper #FBF6F3`.
- Generate 50-900 tints/shades. Verify WCAG AA for every text/bg pair.
- Fonts via `next/font`: serif display (Cormorant/Playfair) + sans (Jost/Poppins) + Bangla (Hind Siliguri / Noto Serif Bengali).
- Fluid type `clamp()`, tight headings, uppercase micro-labels, hairline dividers.

## Navigation
- Header: announcement bar → logo/search/account/wishlist/cart → `Men|Women|Kids|New Arrivals|Sale|Stories`.
- Mega-menu: full-width, 4 cols (bold headings, light links, "view all") + featured image/blurb.
- Sticky header condenses on scroll. Mobile: bottom tab bar + accordion drawer.
- Keyboard-complete: focus trap, Esc closes, visible `--terracotta` ring.

## Product
- Card: hover lift 4px, image #2 cross-fade, quick-add pills slide up, heart pop.
- Gallery: max 5 images, thumb rail, hover zoom, mobile swipe, lightbox, alt required.
- Variant picker with live stock, per-section size-guide modal, district ETA.
- Sticky ATC bar on mobile. Back-in-stock signup if variant = 0.

## States / Voice
- Skeletons (shimmer), empty with suggestions, branded errors.
- Microcopy: warm, concise, confident ("Free exchange · COD available").
