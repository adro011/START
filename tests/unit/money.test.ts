// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { formatBDT } from '@/lib/format';

// Contract under test: formatBDT(paisa: number): string
// - Money is integer paisa everywhere (plan §6).
// - 249000 paisa = Tk 2,490 -> '৳2,490'
// - 0 -> '৳0'
// - Non-integer input must round (never leak float artefacts).

describe('formatBDT', () => {
  it("formats 249000 paisa as '৳2,490'", () => {
    expect(formatBDT(249000)).toBe('৳2,490');
  });

  it("formats 0 as '৳0'", () => {
    expect(formatBDT(0)).toBe('৳0');
  });

  it('formats whole-taka values without trailing decimals', () => {
    expect(formatBDT(100)).toBe('৳1');
    expect(formatBDT(100000)).toBe('৳1,000');
  });

  it('rounds non-integer paisa to the nearest paisa (no float leakage)', () => {
    // Any sane impl does Math.round(paisa) first; display style
    // (decimals vs rounded taka) may vary, but rounding must hold.
    expect(formatBDT(10.4)).toBe(formatBDT(10));
    expect(formatBDT(10.6)).toBe(formatBDT(11));
    expect(formatBDT(0.5)).toBe(formatBDT(1));
    expect(formatBDT(249000.4)).toBe(formatBDT(249000));
    expect(formatBDT(249000.6)).toBe(formatBDT(249001));
  });

  it('always returns a ৳-prefixed string and never throws on decimals', () => {
    for (const v of [1.5, 99.99, 249099.49, 249099.5]) {
      const s = formatBDT(v);
      expect(typeof s).toBe('string');
      expect(s.startsWith('৳')).toBe(true);
    }
  });
});
