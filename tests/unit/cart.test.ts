// @vitest-environment node
// Defensive zustand-persist test: runs in plain node (no jsdom).
// zustand works in node; the persist middleware needs a storage, so we
// stub localStorage with an in-memory map BEFORE dynamically importing
// the store. Static import would evaluate the store module before the stub.
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

type CartState = {
  items: Array<Record<string, unknown>>;
  add?: (...args: never[]) => void;
  remove?: (...args: never[]) => void;
  setQty?: (...args: never[]) => void;
  clear?: () => void;
  count?: number | (() => number);
  subtotal?: number | (() => number);
  getState?: () => CartState;
  setState?: (s: Record<string, unknown>) => void;
};

type StoreApi = {
  getState: () => CartState;
  setState: (partial: Record<string, unknown>) => void;
};

let useCart: StoreApi;

function memoryLocalStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  };
}

beforeAll(async () => {
  if (typeof (globalThis as Record<string, unknown>).localStorage === 'undefined') {
    Object.defineProperty(globalThis, 'localStorage', {
      value: memoryLocalStorage(),
      configurable: true,
      writable: true,
    });
  }
  // Dynamic import AFTER the stub so zustand/persist never sees undefined storage.
  useCart = (await import('@/store/cart')).useCart as unknown as StoreApi;
  expect(useCart, 'expected @/store/cart to export useCart').toBeDefined();
});

beforeEach(() => {
  const s = useCart.getState() as CartState;
  if (typeof s.clear === 'function') s.clear();
  else useCart.setState({ items: [] });
});

// Build an item carrying every common price-field alias so the test is
// agnostic to the store's exact field name (price_paisa / unit_price_paisa / price).
function item(id: string, pricePaisa: number, qty = 1, extra: Record<string, unknown> = {}) {
  return {
    id,
    sku: id,
    variantId: id,
    variant_id: id,
    productId: `p-${id}`,
    slug: `p-${id}`,
    name: `Test product ${id}`,
    title: `Test product ${id}`,
    image: '/hero/men.svg',
    size: 'M',
    color: 'Terracotta',
    qty,
    quantity: qty,
    stock: 12,
    pricePaisa,
    price_paisa: pricePaisa,
    unit_price_paisa: pricePaisa,
    price: pricePaisa,
    unitPrice: pricePaisa,
    ...extra,
  };
}

function subtotal(): number {
  const s = useCart.getState() as CartState;
  return typeof s.subtotal === 'function' ? (s.subtotal as () => number)() : Number(s.subtotal ?? 0);
}

function count(): number {
  const s = useCart.getState() as CartState;
  if (typeof s.count === 'function') return (s.count as () => number)();
  if (typeof s.count === 'number') return s.count;
  // Fallback: sum qty fields if store exposes no count selector.
  const items = (s.items ?? []) as Array<Record<string, unknown>>;
  return items.reduce((n, it) => n + Number(it.qty ?? it.quantity ?? 1), 0);
}

describe('cart store (paisa math)', () => {
  it('exposes items/add/remove/setQty/clear/count/subtotal', () => {
    const s = useCart.getState() as CartState;
    expect(Array.isArray(s.items)).toBe(true);
    for (const k of ['add', 'remove', 'setQty', 'clear'] as const) {
      expect(typeof s[k], `store.${k} should be a function`).toBe('function');
    }
    expect(s.count !== undefined && s.subtotal !== undefined).toBe(true);
  });

  it('adds items and computes subtotal in paisa', () => {
    const s = useCart.getState() as CartState;
    (s.add as (i: unknown) => void)(item('v1', 249000, 1));
    (useCart.getState().add as (i: unknown) => void)(item('v2', 100000, 1));
    expect(count()).toBe(2);
    expect(subtotal()).toBe(349000);
  });

  it('merges or sums repeated adds of the same variant (qty + subtotal)', () => {
    const s = useCart.getState() as CartState;
    (s.add as (i: unknown) => void)(item('v1', 249000, 1));
    (useCart.getState().add as (i: unknown) => void)(item('v1', 249000, 1));
    expect(count()).toBe(2);
    expect(subtotal()).toBe(498000);
  });

  it('setQty updates subtotal: 3 x 249000 = 747000', () => {
    const s = useCart.getState() as CartState;
    (s.add as (i: unknown) => void)(item('v1', 249000, 1));
    (useCart.getState().setQty as (id: string, q: number) => void)('v1', 3);
    expect(count()).toBe(3);
    expect(subtotal()).toBe(747000);
  });

  it('remove drops only that line', () => {
    const s = useCart.getState() as CartState;
    (s.add as (i: unknown) => void)(item('v1', 249000, 1));
    (useCart.getState().add as (i: unknown) => void)(item('v2', 100000, 2));
    expect(subtotal()).toBe(449000);
    (useCart.getState().remove as (id: string) => void)('v1');
    expect(subtotal()).toBe(200000);
    expect(count()).toBe(2);
  });

  it('clear empties the cart', () => {
    const s = useCart.getState() as CartState;
    (s.add as (i: unknown) => void)(item('v1', 249000, 2));
    (useCart.getState().clear as () => void)();
    expect(useCart.getState().items).toEqual([]);
    expect(subtotal()).toBe(0);
    expect(count()).toBe(0);
  });
});
