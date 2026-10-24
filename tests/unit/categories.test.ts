// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  CATEGORIES,
  CATEGORY_GROUPS,
  PRODUCTS,
  getCategory,
  getCategoryGroups,
  getSectionCategories,
} from '@/lib/catalog';

// Contract under test: the authoritative category taxonomy.
// - 64 leaf categories total: MEN 14 · WOMEN 14 · BOYS 16 · GIRLS 20.
// - Every leaf slug is globally unique and resolvable via getCategory().
// - Every product references a real leaf category (no orphaned categories).

describe('category taxonomy', () => {
  it('defines exactly 64 leaf categories', () => {
    expect(CATEGORIES).toHaveLength(64);
  });

  it('defines the correct per-section counts (14 / 14 / 16 / 20)', () => {
    expect(getSectionCategories('men')).toHaveLength(14);
    expect(getSectionCategories('women')).toHaveLength(14);
    const boys = getSectionCategories('kids').filter((c) => c.group === 'boys');
    const girls = getSectionCategories('kids').filter((c) => c.group === 'girls');
    expect(boys).toHaveLength(16);
    expect(girls).toHaveLength(20);
    expect(getSectionCategories('kids')).toHaveLength(36);
  });

  it('keeps every leaf slug globally unique', () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('resolves every leaf via getCategory', () => {
    for (const c of CATEGORIES) {
      const hit = getCategory(c.slug);
      expect(hit).toBeDefined();
      expect(hit?.section).toBe(c.section);
      expect(hit?.name).toBe(c.name);
    }
  });

  it('exposes navigation groups per section (4 / 4 / 2)', () => {
    expect(getCategoryGroups('men')).toHaveLength(4);
    expect(getCategoryGroups('women')).toHaveLength(4);
    expect(getCategoryGroups('kids')).toHaveLength(2);
    expect(CATEGORY_GROUPS).toHaveLength(10);
  });

  it('covers every leaf across the navigation groups', () => {
    const grouped = CATEGORY_GROUPS.flatMap((g) => g.children.map((k) => k.slug));
    const direct = CATEGORIES.map((c) => c.slug);
    expect([...grouped].sort()).toEqual([...direct].sort());
  });

  it('keeps every product mapped to a real leaf category', () => {
    const known = new Set(CATEGORIES.map((c) => c.slug));
    for (const p of PRODUCTS) {
      expect(known.has(p.category), `product ${p.slug} → category ${p.category}`).toBe(true);
    }
  });
});
