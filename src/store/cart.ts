"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  sku: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  pricePaisa: number;
  qty: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: CartItem) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

function totals(items: CartItem[]): { count: number; subtotal: number } {
  return {
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((n, i) => n + i.qty * i.pricePaisa, 0),
  };
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (item) =>
        set((s) => {
          const found = s.items.find((i) => i.sku === item.sku);
          let items: CartItem[];
          if (found) {
            items = s.items.map((i) =>
              i.sku === item.sku
                ? { ...i, qty: Math.min(Math.max(i.qty + item.qty, 1), Math.max(i.stock, 1)) }
                : i,
            );
          } else {
            items = [...s.items, { ...item, qty: Math.min(item.qty, Math.max(item.stock, 1)) }];
          }
          return { items, open: true, ...totals(items) };
        }),
      remove: (sku) =>
        set((s) => {
          const items = s.items.filter((i) => i.sku !== sku);
          return { items, ...totals(items) };
        }),
      setQty: (sku, qty) =>
        set((s) => {
          if (qty <= 0) {
            const items = s.items.filter((i) => i.sku !== sku);
            return { items, ...totals(items) };
          }
          const items = s.items.map((i) =>
            i.sku === sku ? { ...i, qty: Math.min(qty, Math.max(i.stock, 1)) } : i,
          );
          return { items, ...totals(items) };
        }),
      clear: () => set({ items: [], count: 0, subtotal: 0 }),
      count: 0,
      subtotal: 0,
    }),
    { name: "brand-cart", partialize: (s) => ({ items: s.items }) as CartState,
      merge: (persisted, current) => {
        const p = persisted as Partial<CartState>;
        const items = p.items ?? [];
        return { ...current, items, ...totals(items) };
      },
    },
  ),
);
