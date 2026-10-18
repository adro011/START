"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/store/cart";
import { formatBDT } from "@/lib/format";
import { validateCoupon } from "@/lib/coupons";

export default function CartPage() {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function apply() {
    const v = validateCoupon(code, subtotal);
    if (v.valid) {
      setApplied(v.code);
      setError(null);
    } else {
      setError(v.reason ?? "Invalid coupon. Try WELCOME10 or FREESHIP.");
    }
  }

  const validation = applied ? validateCoupon(applied, subtotal) : null;
  const discount = validation?.valid ? validation.discount_paisa : 0;
  const freeShip = validation?.valid ? validation.freeShipping : false;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Your bag ({items.length})</h1>
      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border p-10 text-center">
          <p className="font-medium">Your bag is empty.</p>
          <div className="mt-3 flex justify-center gap-3 text-sm">
            <Link href="/men" className="underline">Shop Men</Link>
            <Link href="/women" className="underline">Shop Women</Link>
            <Link href="/kids" className="underline">Shop Kids</Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_300px]">
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.sku} className="flex gap-3 rounded-xl border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-ash">{i.size} · {i.color} · {i.sku}</p>
                  <p className="mt-1 text-sm font-semibold">{formatBDT(i.pricePaisa)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => setQty(i.sku, i.qty - 1)} aria-label="Decrease quantity" className="rounded border px-2">−</button>
                    <span className="text-sm">{i.qty}</span>
                    <button onClick={() => setQty(i.sku, i.qty + 1)} aria-label="Increase quantity" className="rounded border px-2">+</button>
                    <button onClick={() => remove(i.sku)} className="ml-2 text-xs underline">Remove</button>
                  </div>
                </div>
              </li>
            ))}
            <button onClick={clear} className="text-xs underline">Clear bag</button>
          </ul>
          <aside className="h-fit space-y-3 rounded-xl border p-4">
            <div className="flex gap-2">
              <div className="textInputWrapper min-w-0 flex-1">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Coupon (WELCOME10 / FREESHIP)"
                  aria-label="Coupon code"
                  className="textInput w-full py-2 px-3 bg-[#111111] uppercase placeholder:text-ash outline-none"
                />
              </div>
              <button onClick={apply} className="rounded-full border px-4 py-2 text-sm font-medium">Apply</button>
            </div>
            {applied && validation?.valid && (
              <p className="text-xs text-green-700">
                Applied {applied}{freeShip ? " — free shipping at checkout" : " — 10% off (capped)"}
              </p>
            )}
            {error && <p className="text-xs text-red-700">{error}</p>}
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-semibold">{formatBDT(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Coupon discount</span>
                <span>−{formatBDT(discount)}</span>
              </div>
            )}
            <p className="text-xs text-ash">Shipping calculated at checkout (Dhaka ৳60 · outside ৳120).</p>
            <Link href="/checkout" className="block rounded-full bg-gold py-3 text-center text-sm font-semibold text-black hover:bg-gold-dark">
              Checkout →
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
