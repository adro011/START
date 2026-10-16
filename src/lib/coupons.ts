// Coupon rules (single source of truth for storefront + tests).
// Money is integer paisa. Codes are case-insensitive, trimmed.
//
// Supported codes (plan §6 coupons table):
// - WELCOME10: percent 10%, min subtotal 100000 paisa (Tk 1,000),
//   capped at 50000 paisa (Tk 500 discount max).
// - FREESHIP: free_shipping, min subtotal 50000 paisa (Tk 500),
//   discount 0, flags free shipping only.

export type CouponValidation = {
  valid: boolean;
  code: string;
  discount_paisa: number;
  freeShipping: boolean;
  reason?: string;
  min_subtotal_paisa?: number;
};

export const COUPONS = {
  WELCOME10: { type: 'percent' as const, value: 10, min_subtotal_paisa: 100_000, max_discount_paisa: 50_000 },
  FREESHIP: { type: 'free_shipping' as const, value: 0, min_subtotal_paisa: 50_000 },
} as const;

export function normaliseCouponCode(raw: string): string {
  return (raw ?? '').trim().toUpperCase();
}

export function validateCoupon(rawCode: string, subtotalPaisa: number): CouponValidation {
  const code = normaliseCouponCode(rawCode);
  const subtotal = Number(subtotalPaisa);

  if (!code) {
    return { valid: false, code: '', discount_paisa: 0, freeShipping: false, reason: 'Enter a coupon code.' };
  }
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return { valid: false, code, discount_paisa: 0, freeShipping: false, reason: 'Invalid subtotal.' };
  }

  if (code === 'WELCOME10') {
    const rule = COUPONS.WELCOME10;
    if (subtotal < rule.min_subtotal_paisa) {
      return {
        valid: false,
        code,
        discount_paisa: 0,
        freeShipping: false,
        reason: `Requires minimum subtotal of Tk ${(rule.min_subtotal_paisa / 100).toLocaleString('en-BD')}.`,
        min_subtotal_paisa: rule.min_subtotal_paisa,
      };
    }
    const raw = Math.floor((subtotal * rule.value) / 100);
    const discount_paisa = Math.min(raw, rule.max_discount_paisa);
    return { valid: true, code, discount_paisa, freeShipping: false };
  }

  if (code === 'FREESHIP') {
    const rule = COUPONS.FREESHIP;
    if (subtotal < rule.min_subtotal_paisa) {
      return {
        valid: false,
        code,
        discount_paisa: 0,
        freeShipping: false,
        reason: `Requires minimum subtotal of Tk ${(rule.min_subtotal_paisa / 100).toLocaleString('en-BD')}.`,
        min_subtotal_paisa: rule.min_subtotal_paisa,
      };
    }
    return { valid: true, code, discount_paisa: 0, freeShipping: true };
  }

  return { valid: false, code, discount_paisa: 0, freeShipping: false, reason: 'Invalid or expired coupon.' };
}
