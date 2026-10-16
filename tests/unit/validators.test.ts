// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { validateCoupon } from '@/lib/coupons';

// BD phone rule (plan §7 bd-commerce): ^01[3-9]\d{8}$  (11 digits, 013-019)
const PHONE_RE = /^01[3-9]\d{8}$/;

describe('BD phone validation', () => {
  const valid = ['01312345678', '01412345678', '01512345678', '01612345678', '01712345678', '01812345678', '01912345678'];

  it.each(valid)('accepts %s', (p) => {
    expect(PHONE_RE.test(p)).toBe(true);
  });

  const invalid: Array<[string, string]> = [
    ['01212345678', '02x prefix is not a mobile operator'],
    ['01112345678', '011 not allowed'],
    ['01012345678', '010 not allowed'],
    ['02112345678', 'must start with 01'],
    ['0131234567', 'too short (10 digits)'],
    ['013123456789', 'too long (12 digits)'],
    ['+8801712345678', 'country-code form handled elsewhere, not by this regex'],
    ['01712 345678', 'spaces rejected'],
    ['01712-345678', 'dashes rejected'],
    ['', 'empty rejected'],
    ['01a12345678', 'letters rejected'],
  ];

  it.each(invalid)('rejects %s (%s)', (p) => {
    expect(PHONE_RE.test(p)).toBe(false);
  });
});

describe('validateCoupon (src/lib/coupons)', () => {
  it('WELCOME10 gives 10% off above the minimum', () => {
    // 200000 paisa = Tk 2,000 -> 10% = 20000 paisa
    const r = validateCoupon('WELCOME10', 200_000);
    expect(r.valid).toBe(true);
    expect(r.discount_paisa).toBe(20_000);
    expect(r.freeShipping).toBe(false);
  });

  it('WELCOME10 is case-insensitive and trims whitespace', () => {
    expect(validateCoupon('welcome10', 200_000).valid).toBe(true);
    expect(validateCoupon('  Welcome10  ', 200_000).discount_paisa).toBe(20_000);
  });

  it('WELCOME10 rejects below min subtotal (Tk 1,000)', () => {
    const r = validateCoupon('WELCOME10', 50_000);
    expect(r.valid).toBe(false);
    expect(r.discount_paisa).toBe(0);
    expect(r.reason).toMatch(/minimum/i);
  });

  it('WELCOME10 caps the discount at Tk 500', () => {
    // 1,000,000 paisa = Tk 10,000 -> 10% = Tk 1,000, capped to Tk 500
    const r = validateCoupon('WELCOME10', 1_000_000);
    expect(r.valid).toBe(true);
    expect(r.discount_paisa).toBe(50_000);
  });

  it('FREESHIP flags free shipping with zero discount', () => {
    const r = validateCoupon('FREESHIP', 100_000);
    expect(r.valid).toBe(true);
    expect(r.freeShipping).toBe(true);
    expect(r.discount_paisa).toBe(0);
  });

  it('FREESHIP rejects below min subtotal (Tk 500)', () => {
    const r = validateCoupon('FREESHIP', 10_000);
    expect(r.valid).toBe(false);
    expect(r.freeShipping).toBe(false);
  });

  it('rejects unknown and empty codes', () => {
    expect(validateCoupon('NOTACODE', 500_000).valid).toBe(false);
    expect(validateCoupon('', 500_000).valid).toBe(false);
    expect(validateCoupon('   ', 500_000).valid).toBe(false);
  });
});
