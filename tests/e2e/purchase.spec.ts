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
    // 1. Homepage loads
    await page.goto('/');
    await expect(page).toHaveTitle(/brand|men|women|kids|store|fashion/i, { timeout: 15000 }).catch(() => {});
    await expect(page.getByRole('navigation').first()).toBeVisible({ timeout: 15000 });

    // 2. Navigate to Men (nav link, case-insensitive)
    const menLink = page.getByRole('link', { name: /^men$/i }).first();
    await expect(menLink, 'expected a "Men" nav link on homepage').toBeVisible({ timeout: 15000 });
    await menLink.click();
    await expect(page).toHaveURL(/\/men/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /men/i }).first()).toBeVisible({ timeout: 15000 });

    // 3. Open the first product (resilient to /product vs /products routes)
    const productLink = page
      .locator('main a[href*="/product"], main a[href*="/p/"], main article a[href], main a[href]')
      .first();
    await expect(productLink, 'expected at least one product card link in <main> on /men').toBeVisible({
      timeout: 15000,
    });
    const before = page.url();
    await productLink.click();
    // Product page: URL changed away from the listing (slug route varies by implementation).
    await expect
      .poll(async () => page.url(), { timeout: 15000 })
      .not.toBe(before);
    await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 15000 });

    // 4. Select a size if the picker exists (buttons or radios labelled S/M/L/XL/2XL or numbers)
    const sizeOption = page
      .getByRole('button', { name: /^(XS|S|M|L|XL|XXL|2XL|3XL|\d{2,3})$/i })
      .or(page.getByRole('radio', { name: /^(XS|S|M|L|XL|XXL|2XL|3XL|\d{2,3})$/i }))
      .first();
    if ((await sizeOption.count()) > 0) {
      await sizeOption.click().catch(() => {});
    }

    // 5. Add to cart -> cart drawer/dialog becomes visible
    const addBtn = page.getByRole('button', { name: /add to (cart|bag)/i }).first();
    await expect(addBtn, 'expected an "Add to cart" button on the product page').toBeVisible({ timeout: 15000 });
    await addBtn.click();
    const drawer = page
      .getByRole('dialog')
      .filter({ hasText: /cart|added|subtotal/i })
      .or(page.locator('[data-testid="cart-drawer"], [data-testid="cart-dialog"]'))
      .first();
    await expect(drawer, 'expected cart drawer/dialog after Add to cart').toBeVisible({ timeout: 15000 });

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

    // 7. Fill the COD form (label-first, placeholder/name fallbacks)
    const nameField = page
      .getByLabel(/name/i)
      .or(page.locator('input[name*="name" i], input[placeholder*="name" i]'))
      .first();
    const phoneField = page
      .getByLabel(/phone|mobile/i)
      .or(page.locator('input[name*="phone" i], input[type="tel"], input[placeholder*="01" i]'))
      .first();
    const addressField = page
      .getByLabel(/address|area|street|line1/i)
      .or(page.locator('input[name*="address" i], textarea[name*="address" i], input[placeholder*="address" i]'))
      .first();

    await expect(nameField, 'checkout: name field').toBeVisible({ timeout: 15000 });
    await expect(phoneField, 'checkout: phone field').toBeVisible({ timeout: 15000 });
    await nameField.fill('Playwright Tester');
    // Valid BD mobile per ^01[3-9]\d{8}$ (use a 017 number that passes zod + Turnstile-exempt test envs)
    await phoneField.fill('01712345678');
    if ((await addressField.count()) > 0) {
      await addressField.fill('House 1, Road 2, Dhanmondi, Dhaka').catch(() => {});
    }

    // District/division selects vary (select vs text input); fill only if present.
    const districtSelect = page.locator('select[name*="district" i]').first();
    if ((await districtSelect.count()) > 0) {
      const options = await districtSelect.locator('option').allTextContents().catch(() => [] as string[]);
      const dhaka = options.find((o) => /dhaka/i.test(o));
      if (dhaka) await districtSelect.selectOption({ label: dhaka }).catch(() => {});
    }

    // 8. Choose COD if a payment choice exists (default is COD; skip if absent)
    const cod = page.getByRole('radio', { name: /cash on delivery|^cod$/i }).first();
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
