"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/store/cart";
import { FREE_SHIP_THRESHOLD_PAISA } from "@/config/site";
import { cn, formatBDT } from "../lib/format";

/**
 * Slide-over cart drawer (spring-ish ease, transform/opacity only).
 * Free-shipping progress vs FREE_SHIP_THRESHOLD_PAISA, qty steppers,
 * remove, subtotal, checkout link.
 */
export function CartDrawer() {
  const { items, subtotal, open, setOpen, setQty, remove } = useCart();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
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
    >
      <div
        className={cn(
          "absolute inset-0 bg-[#172121]/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          "absolute top-0 right-0 flex h-full w-[92vw] max-w-[420px] flex-col bg-[#FBF6F3] shadow-2xl transition-transform duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-[#172121]/10 px-5 py-4">
          <p className="font-display text-[24px] font-medium">
            Your bag {items.length > 0 && `(${items.length})`}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            tabIndex={open ? 0 : -1}
            className="p-2 text-[#172121]/80 hover:text-clay"
          >
            ✕
          </button>
        </div>

        {/* Free-shipping progress */}
        <div className="border-b border-[#172121]/10 px-5 py-3">
          {remaining > 0 ? (
            <p className="text-[13px] text-[#172121]/75">
              <span className="font-semibold text-[#7D451B]">
                {formatBDT(remaining)}
              </span>{" "}
              away from free delivery
            </p>
          ) : (
            <p className="text-[13px] font-medium text-[#7E9181]">
              Free delivery unlocked — nicely done.
            </p>
          )}
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#172121]/10"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-[#D5573B] transition-[width] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-display text-[28px] text-[#172121]">
                Your bag is empty
              </p>
              <p className="max-w-[28ch] text-[14px] text-[#172121]/80">
                Beautiful things take a moment. Start with what just landed.
              </p>
              <Link
                href="/new-arrivals"
                onClick={close}
                tabIndex={open ? 0 : -1}
                className="mt-2 bg-[#172121] px-6 py-3 text-[12px] font-semibold tracking-[0.14em] text-[#FBF6F3] uppercase hover:bg-clay"
              >
                Shop new arrivals
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((l) => (
                <li key={l.sku} className="flex gap-3">
                  <div className="relative h-[96px] w-[76px] shrink-0 overflow-hidden bg-[#F2CCC3]/50">
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
                        <span className="text-[#172121]/55">
                          {" "}
                          · {l.size}
                          {l.color ? ` · ${l.color}` : ""}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(l.sku)}
                        aria-label={`Remove ${l.name}`}
                        tabIndex={open ? 0 : -1}
                        className="p-1 text-[16px] text-[#172121]/70 hover:text-clay"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#172121]/15">
                        <button
                          type="button"
                          onClick={() => setQty(l.sku, l.qty - 1)}
                          aria-label="Decrease quantity"
                          tabIndex={open ? 0 : -1}
                          className="px-2.5 py-1 text-[15px] hover:bg-[#F2CCC3]/60"
                        >
                          −
                        </button>
                        <span className="min-w-[28px] text-center text-[14px] font-medium">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(l.sku, l.qty + 1)}
                          aria-label="Increase quantity"
                          tabIndex={open ? 0 : -1}
                          className="px-2.5 py-1 text-[15px] hover:bg-[#F2CCC3]/60"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[14px] font-semibold text-[#7D451B]">
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
          <div className="border-t border-[#172121]/10 px-5 py-4">
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-[#172121]/70">Subtotal</span>
              <span className="font-semibold text-[#7D451B]">
                {formatBDT(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] text-[#172121]/55">
              Delivery & discounts calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={close}
              tabIndex={open ? 0 : -1}
              className="mt-3 block bg-clay py-3.5 text-center text-[13px] font-semibold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#7D451B]"
            >
              Checkout →
            </Link>
            <button
              type="button"
              onClick={close}
              tabIndex={open ? 0 : -1}
              className="mt-2 w-full py-2 text-center text-[13px] font-medium tracking-[0.1em] text-[#172121]/70 uppercase underline-offset-4 hover:text-[#172121] hover:underline"
            >
              Keep browsing
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
