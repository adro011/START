import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Axe budget (plan §9): zero critical/serious violations on
// home, listing, cart (+ checkout-adjacent). Moderate/minor are
// reported but do not fail the build.

const ROUTES = ['/', '/men', '/cart'] as const;

for (const route of ROUTES) {
  test(`axe: ${route} has zero serious/critical violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    // Let Lenis/hero animations settle so axe sees the final DOM.
    await page.waitForTimeout(800);

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    const blocking = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(
      blocking,
      `${route}: serious/critical a11y violations:\n` +
        blocking.map((v) => `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n'),
    ).toEqual([]);
  });
}
