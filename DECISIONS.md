# DECISIONS

1. npm instead of pnpm — no admin rights for corepack activation (Program Files EPERM); npm ships with Node and works without elevation.
2. Google Fonts via `<link>` not `next/font` — offline-build safe; `next/font` fetch fails without network during build.
3. No framer-motion initially — CSS-only motion (transform/opacity, Lenis later); add a motion library only when hero/rail work demands it.
