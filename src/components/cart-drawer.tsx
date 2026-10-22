"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { FREE_SHIP_THRESHOLD_PAISA } from "@/config/site";
import { getDict } from "@/lib/dictionary";
import type { Locale } from "@/lib/dictionary";
import { cn, formatBDT } from "../lib/format";

/**
 * Slide-over cart drawer (spring-ish ease, transform/opacity only).
 * Free-shipping progress vs FREE_SHIP_THRESHOLD_PAISA, qty steppers,
 * remove, subtotal, checkout link.
 */
export function CartDrawer({ locale }: { locale: Locale }) {
  const d = getDict(locale);
  const { items, subtotal, open, setOpen, setQty, remove } = useCart();
  const close = () => setOpen(false);
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Move focus into the drawer and restore it on close.
    prevFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      // Traps-ish Tab cycle: keep focus on the drawer's controls.
      if (e.key === "Tab") {
        const root = drawerRef.current;
        if (!root) return;
        const items = [...root.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      prevFocus.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  const remaining = Math.max(0, FREE_SHIP_THRESHOLD_PAISA - subtotal);
  const progress = Math.min(
    100,
    subtotal > 0 ? (subtotal / FREE_SHIP_THRESHOLD_PAISA) * 100 : 0,
  );

  return (
    <div
      className={cn("fixed inset-0 z-[60]", !open && "pointer-events-none")}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        data-testid="cart-drawer"
        aria-modal="true"
        aria-label={d.cart_dialog_label}
        className={cn(
          "absolute top-0 right-0 flex h-full w-[92vw] max-w-[420px] flex-col border border-white/15 bg-[var(--color-dark-iron)] shadow-2xl transition-transform duration-300 motion-reduce:transition-none [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
          <p className="font-display text-[24px] font-medium">
            {d.cart_bag} {items.length > 0 && `(${items.length})`}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label={d.cart_close}
            tabIndex={open ? 0 : -1}
            className="p-2 text-steel hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
          >
            ✕
          </button>
        </div>

        {/* Free-shipping progress */}
        <div className="border-b border-white/15 px-5 py-3">
          {remaining > 0 ? (
            <p className="text-[13px] text-steel">
              <span className="font-semibold text-gold">
                {d.cart_away_from_free.replace("{amount}", formatBDT(remaining))}
              </span>
            </p>
          ) : (
            <p className="text-[13px] font-medium text-[#7E9181]">
              {d.cart_free_unlocked}
            </p>
          )}
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-500 motion-reduce:transition-none [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-display text-[28px] text-[var(--color-smoke)]">
                {d.cart_empty_title}
              </p>
              <p className="max-w-[28ch] text-[14px] text-steel">
                {d.cart_empty_sub}
              </p>
              <Link
                href="/new-arrivals"
                onClick={close}
                tabIndex={open ? 0 : -1}
                className="mt-2 bg-gold px-6 py-3 text-[12px] font-semibold tracking-[0.14em] text-black uppercase hover:bg-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
              >
                {d.cart_shop_new}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((l) => (
                <li key={l.sku} className="flex gap-3">
                  <div className="relative h-[96px] w-[76px] shrink-0 overflow-hidden bg-[var(--color-blush)]/50">
                    {l.image ? (
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="76px"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        className="font-display flex h-full items-center justify-center text-[24px] text-[#7D451B]/50"
                        aria-hidden="true"
                      >
                        {l.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] leading-snug font-medium">
                        {l.name}
                        <span className="text-ash">
                          {" "}
                          · {l.size}
                          {l.color ? ` · ${l.color}` : ""}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(l.sku)}
                        aria-label={d.cart_remove.replace("{name}", l.name).replace("{size}", l.size)}
                        tabIndex={open ? 0 : -1}
                        className="p-1 text-[16px] text-steel hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-white/15">
                        <button
                          type="button"
                          onClick={() => setQty(l.sku, l.qty - 1)}
                          aria-label={d.cart_decrease.replace("{name}", l.name).replace("{size}", l.size)}
                          tabIndex={open ? 0 : -1}
                          className="px-2.5 py-1 text-[15px] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                        >
                          −
                        </button>
                        <span className="min-w-[28px] text-center text-[14px] font-medium">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(l.sku, l.qty + 1)}
                          aria-label={d.cart_increase.replace("{name}", l.name).replace("{size}", l.size)}
                          tabIndex={open ? 0 : -1}
                          className="px-2.5 py-1 text-[15px] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[14px] font-semibold text-gold">
                        {formatBDT(l.pricePaisa * l.qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/15 px-5 py-4">
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-steel">{d.cart_subtotal}</span>
              <span className="font-semibold text-gold">
                {formatBDT(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-ash">
              {d.cart_delivery_note}
            </p>
            <Link
              href="/checkout"
              onClick={close}
              tabIndex={open ? 0 : -1}
              className="mt-3 block bg-gold py-3.5 text-center text-[13px] font-semibold tracking-[0.16em] text-black uppercase transition-colors hover:bg-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)] motion-reduce:transition-none"
            >
              {d.cart_checkout}
            </Link>
            <button
              type="button"
              onClick={close}
              tabIndex={open ? 0 : -1}
              className="mt-2 w-full py-2 text-center text-[13px] font-medium tracking-[0.1em] text-steel uppercase underline-offset-4 hover:text-[var(--color-smoke)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
            >
              {d.cart_keep_browsing}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
