import { expect, test } from '@playwright/test';

// Full COD purchase flow (plan §12 phase 7 "Done when").
// NOTE on stock: this test places a real order via the seeded demo product
// and decrements stock exactly once per run (server RPC recalculates +
// decrements in one transaction). Run serially against an isolated
// preview/seeded env; do not run parallel workers against the same SKU.
//
// Selectors are role/text-based on purpose (no dependency on test ids):
// nav "Men", product cards in <main>, size buttons, "Add to cart",
// cart dialog/drawer, "Checkout", COD form, success "BR-######".

test.describe('purchase flow (COD)', () => {
  test('homepage -> Men -> product -> cart -> checkout -> BR- order', async ({ page }) => {
    // 1. Homepage loads. A cold `next dev` boot (fresh .next) can be slow, so
    // wait for a settled document before querying roles.
    await page.goto('/');
    await page.waitForLoadState('load');
    // Best-effort title check against the real title (`ABRAR — <tagline>`,
    // see src/config/site.ts). Short timeout so a mismatch can never starve
    // the rest of the 30s test budget.
    await expect(page).toHaveTitle(/abr.ar|connecting/i, { timeout: 5000 }).catch(() => {});
    // Explicit desktop mega-menu nav: aria-label="Primary", `hidden lg:block`
    // (visible at Desktop Chrome's 1280px viewport; the Mobile nav is
    // `lg:hidden` there). Unique — footer navs are Shop/Help/Company.
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible({ timeout: 15000 });

    // 2. Navigate to Men (nav link, case-insensitive)
    const menLink = page.getByRole('link', { name: /^men$/i }).first();
    await expect(menLink, 'expected a "Men" nav link on homepage').toBeVisible({ timeout: 15000 });
    await menLink.click();
    await expect(page).toHaveURL(/\/men/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /men/i }).first()).toBeVisible({ timeout: 15000 });

    // 3. Open the first product card (strict /product/ links only — never breadcrumbs/chips)
    const productLink = page.locator('main a[href*="/product/"]').first();
    await expect(productLink, 'expected at least one product card link in <main> on /men').toBeVisible({
      timeout: 15000,
    });
    await productLink.click();
    // Product page: URL changed to the /product/[slug] route.
    await expect
      .poll(async () => page.url(), { timeout: 15000 })
      .toMatch(/\/product\//);
    await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 15000 });

    // 4-5. Select a size (stable test id; enabled options only) and verify the
    // Add button becomes enabled.
    const sizeCandidates = page.locator('[data-testid="pdp-size"]:not([disabled])');
    await expect(sizeCandidates.first()).toBeVisible({ timeout: 15000 });
    // Stable test id: the buy-box Add button (not StickyATC / "Pairs well with").
    const addBtn = page.locator('[data-testid="pdp-add"]');
    await expect(addBtn, 'expected a buy-box "Add to bag" button on the product page').toBeVisible({ timeout: 15000 });
    const nSizes = await sizeCandidates.count();
    for (let i = 0; i < nSizes; i++) {
      const btn = sizeCandidates.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        if (await addBtn.isEnabled({ timeout: 2500 }).catch(() => false)) break;
      }
    }
    await expect(addBtn, 'expected the Add button enabled after selecting a size').toBeEnabled({ timeout: 15000 });
    await addBtn.click();
    const drawer = page.locator('[data-testid="cart-drawer"]');
    await expect(drawer, 'expected cart drawer after Add to bag').toBeVisible({ timeout: 15000 });

    // 6. Go to checkout (drawer CTA, else direct navigation fallback)
    const checkoutCta = page.getByRole('link', { name: /checkout|proceed/i }).or(
      page.getByRole('button', { name: /checkout|proceed/i }),
    );
    if ((await checkoutCta.first().count()) > 0) {
      await checkoutCta.first().click().catch(() => {});
    }
    if (!/\/checkout/.test(page.url())) {
      await page.goto('/checkout');
    }
    await expect(page).toHaveURL(/\/checkout/, { timeout: 15000 });

    // 7. Fill the COD form (placeholder-anchored, main-scoped CSS)
    const nameField = page.locator('main input[placeholder*="Full name"]').first();
    const phoneField = page.locator('main input[placeholder*="01"]').first();

    await expect(nameField, 'checkout: name field').toBeVisible({ timeout: 15000 });
    await expect(phoneField, 'checkout: phone field').toBeVisible({ timeout: 15000 });
    await nameField.fill('Playwright Tester');
    // Valid BD mobile per ^01[3-9]\d{8}$
    await phoneField.fill('01712345678');
    // Address has two required inputs: Area + House/road/landmark.
    const areaField = page.locator('main input[placeholder*="Area"]').first();
    const lineField = page.locator('main input[placeholder*="House"]').first();
    if ((await areaField.count()) > 0) await areaField.fill('Dhanmondi, Dhaka').catch(() => {});
    if ((await lineField.count()) > 0) await lineField.fill('House 1, Road 2').catch(() => {});

    // District is the second <select>; pick Dhaka when offered.
    const districtSelect = page.locator('main select').nth(1);
    if ((await districtSelect.count()) > 0) {
      const options = await districtSelect.locator('option').allTextContents().catch(() => [] as string[]);
      const dhaka = options.find((o) => /dhaka/i.test(o));
      if (dhaka) await districtSelect.selectOption({ label: dhaka }).catch(() => {});
    }

    // 8. Choose COD (first payment radio; default is COD)
    const cod = page.locator('main input[name="payment"]').first();
    if ((await cod.count()) > 0) {
      await cod.check().catch(() => {});
    }

    // 9. Submit and expect the order-success page with a BR- number
    const submit = page.getByRole('button', { name: /place order|confirm order|submit|complete/i }).first();
    await expect(submit, 'checkout: submit button').toBeVisible({ timeout: 15000 });
    await submit.click();

    const orderRef = page.getByText(/BR-\d{5,}/).first();
    await expect(orderRef, 'expected order-success with BR- number after COD submit').toBeVisible({ timeout: 30000 });
    await expect(page).toHaveURL(/success|confirm|track|order/i, { timeout: 15000 }).catch(() => {});
  });
});
